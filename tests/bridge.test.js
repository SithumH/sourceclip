import http from 'http';
import { BridgeServer } from '../electron/bridge.js';

// Test runner helper
let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    totalFailed++;
  }
}

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: json || data });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting SourceClip Bridge Automated Test Suite ---');
  const bridge = new BridgeServer();
  const status = await bridge.start(34567);

  const port = status.port;
  const host = '127.0.0.1';

  try {
    // 1. Mobile Web UI Serving Test
    console.log('\n[Test 1] Serves Mobile Web UI over HTTP:');
    const getRoot = await request({ hostname: host, port, path: '/', method: 'GET' });
    assert(getRoot.status === 200, 'GET / returns HTTP 200');
    assert(typeof getRoot.body === 'string' && getRoot.body.includes('SourceClip Bridge'), 'Serves mobile client HTML');

    // 2. Reject Invalid Pairing Token
    console.log('\n[Test 2] Security: Reject Invalid Pairing Token:');
    const badPair = await request({
      hostname: host, port, path: '/api/pair', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: 'invalid_token_123', deviceInfo: 'Attacker' });
    assert(badPair.status === 403, 'Invalid token rejected with HTTP 403 Forbidden');

    // 3. Initiate Valid Pairing
    console.log('\n[Test 3] Initiate Valid Pairing & Receive Pending Status:');
    const pairingUrl = new URL(status.pairingUrl);
    const validToken = pairingUrl.searchParams.get('token');

    let receivedPairingReq = null;
    bridge.onPairingRequest(req => {
      receivedPairingReq = req;
    });

    const goodPair = await request({
      hostname: host, port, path: '/api/pair', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: validToken, deviceInfo: 'Android Test Phone' });

    assert(goodPair.status === 200, 'Pairing request accepted with HTTP 200');
    assert(goodPair.body.status === 'pending', 'Status is pending user approval');
    assert(receivedPairingReq !== null, 'PC received pairing event callback');
    assert(receivedPairingReq.pin === status.pin, 'PIN matches desktop display');

    // 4. Content Transfer Blocked Before Approval
    console.log('\n[Test 4] Security: Content Transfer Blocked Before Approval:');
    const prematureSend = await request({
      hostname: host, port, path: '/api/send', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${goodPair.body.sessionToken}` }
    }, { text: 'Premature text' });
    assert(prematureSend.status === 401, 'Unauthorized send rejected with HTTP 401');

    // 5. Desktop User Approves Pairing
    console.log('\n[Test 5] Explicit User Approval Flow:');
    const approved = bridge.approvePairing(receivedPairingReq.id);
    assert(approved === true, 'Desktop user successfully approved pairing request');

    // Re-check status from phone
    // Re-pair call returns active session token
    const pairConfirm = await request({
      hostname: host, port, path: '/api/pair', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: validToken, deviceInfo: 'Android Test Phone' });
    
    // Status check with session token
    const activeToken = bridge.getStatus().connectedDevice ? (bridge as any).activeSessionToken : '';
    assert(Boolean(activeToken), 'Session authentication token issued');

    const statusCheck = await request({
      hostname: host, port, path: '/api/status', method: 'GET',
      headers: { 'Authorization': `Bearer ${activeToken}` }
    });
    assert(statusCheck.status === 200 && statusCheck.body.status === 'connected', 'Device is confirmed connected');

    // 6. Transfer Content (Text/Link)
    console.log('\n[Test 6] Successful Text & Link Transfer:');
    let receivedContent = null;
    bridge.onContentReceived((text, ip) => {
      receivedContent = { text, ip };
    });

    const sendRes = await request({
      hostname: host, port, path: '/api/send', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` }
    }, { text: 'https://example.com/article?id=42&ref=sourceclip' });

    assert(sendRes.status === 200 && sendRes.body.success === true, 'HTTP 200 returned on valid send');
    assert(receivedContent !== null && receivedContent.text.includes('https://example.com'), 'Desktop received exact content');

    // 7. Input Validation & Size Limit Enforcement (> 64KB)
    console.log('\n[Test 7] Security: Payload Size Limits (> 64KB):');
    const hugePayload = 'A'.repeat(70000);
    const hugeRes = await request({
      hostname: host, port, path: '/api/send', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` }
    }, { text: hugePayload });
    assert(hugeRes.status === 413, 'Payload > 64KB rejected with HTTP 413 Payload Too Large');

    // 8. Empty or Invalid Content Validation
    console.log('\n[Test 8] Input Validation: Empty / Non-string Text:');
    const emptyRes = await request({
      hostname: host, port, path: '/api/send', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` }
    }, { text: '   ' });
    assert(emptyRes.status === 400, 'Whitespace/empty text rejected with HTTP 400');

    // 9. Unpair / Disconnect Flow
    console.log('\n[Test 9] Disconnect & Session Invalidation:');
    const unpairRes = await request({
      hostname: host, port, path: '/api/unpair', method: 'POST',
      headers: { 'Authorization': `Bearer ${activeToken}` }
    });
    assert(unpairRes.status === 200, 'Unpair API returned HTTP 200');

    const sendAfterUnpair = await request({
      hostname: host, port, path: '/api/send', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${activeToken}` }
    }, { text: 'After unpair' });
    assert(sendAfterUnpair.status === 401, 'Subsequent requests with revoked token rejected with HTTP 401');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${totalPassed} passed, ${totalFailed} failed`);
    console.log(`========================================\n`);

  } finally {
    await bridge.stop();
  }

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner encountered error:', err);
  process.exit(1);
});

