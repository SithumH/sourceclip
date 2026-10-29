import http from 'http';
import os from 'os';
import crypto from 'crypto';

export interface NetworkInterfaceInfo {
  name: string;
  address: string;
  family: string;
}

export interface PairingRequest {
  id: string;
  deviceInfo: string;
  ip: string;
  pin: string;
  timestamp: number;
}

export interface BridgeStatus {
  isRunning: boolean;
  port: number;
  selectedIp: string;
  availableIps: NetworkInterfaceInfo[];
  pairingUrl: string;
  pin: string;
  connectedDevice: {
    ip: string;
    deviceInfo: string;
    pairedAt: number;
  } | null;
  pendingRequest: PairingRequest | null;
}

// Mobile Web Client HTML/CSS/JS (Served from Bridge Server to phone browser)
const MOBILE_CLIENT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>SourceClip Bridge</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      padding: 16px;
      line-height: 1.5;
      font-size: 14px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 17px;
      color: #1e293b;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-connecting { background: #fef3c7; color: #b45309; }
    .status-connected { background: #dcfce7; color: #15803d; }
    .status-disconnected { background: #fee2e2; color: #b91c1c; }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #334155;
    }
    textarea {
      width: 100%;
      height: 140px;
      padding: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      outline: none;
      transition: border-color 0.15s;
    }
    textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
    }
    .btn-group {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    button {
      flex: 1;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-primary:active { background: #1d4ed8; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:active { background: #e2e8f0; }
    .btn-danger {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
      margin-top: 8px;
      width: 100%;
    }
    .notice {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
      line-height: 1.4;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      left: 16px;
      right: 16px;
      padding: 12px 16px;
      background: #0f172a;
      color: white;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
      font-size: 13px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.2s ease;
      pointer-events: none;
      z-index: 100;
    }
    .toast.show { opacity: 1; transform: translateY(0); }
    .toast.success { background: #15803d; }
    .toast.error { background: #b91c1c; }
    .pin-display {
      font-family: monospace;
      font-size: 24px;
      letter-spacing: 4px;
      font-weight: 700;
      color: #2563eb;
      text-align: center;
      padding: 12px;
      background: #eff6ff;
      border-radius: 8px;
      margin: 12px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <span>📱</span> SourceClip Bridge
    </div>
    <div id="statusBadge" class="status-badge status-connecting">
      <span class="dot"></span>
      <span id="statusText">Connecting...</span>
    </div>
  </div>

  <!-- Waiting Approval Screen -->
  <div id="approvalScreen" class="card" style="display: none; text-align: center;">
    <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
    <div class="card-title" style="font-size: 16px;">Waiting for PC Approval</div>
    <p class="notice">Look at your PC screen and verify the matching code:</p>
    <div id="pinBox" class="pin-display">------</div>
    <p class="notice">Click "Approve" on your SourceClip desktop app to complete pairing.</p>
  </div>

  <!-- Transfer Screen -->
  <div id="transferScreen" style="display: none;">
    <div class="card">
      <div class="card-title">Share Text or Link to PC</div>
      <textarea id="clipText" placeholder="Type or paste any text, link, code snippet, or notes to send to your PC clipboard..."></textarea>
      <div class="btn-group">
        <button id="pasteBtn" class="btn-secondary" type="button">📋 Paste</button>
        <button id="sendBtn" class="btn-primary" type="button">🚀 Send to PC</button>
      </div>
      <p class="notice">Transferred over local Wi-Fi. Content is directly saved in SourceClip desktop clipboard.</p>
    </div>

    <div class="card" style="padding: 12px 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: #64748b;">Connected to SourceClip PC</span>
        <button id="unpairBtn" style="flex: 0; padding: 6px 12px; font-size: 12px;" class="btn-danger">Disconnect</button>
      </div>
    </div>
  </div>

  <!-- Rejected / Disconnected Screen -->
  <div id="errorScreen" class="card" style="display: none; text-align: center;">
    <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
    <div id="errorTitle" class="card-title" style="font-size: 16px;">Disconnected</div>
    <p id="errorMsg" class="notice">The connection was ended or rejected by the desktop app.</p>
    <button id="reconnectBtn" class="btn-primary" style="margin-top: 14px;" type="button">Scan Again</button>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const initialToken = urlParams.get('token') || '';
    let sessionToken = localStorage.getItem('sourceclip_session_token') || '';
    let pollingInterval = null;

    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const approvalScreen = document.getElementById('approvalScreen');
    const transferScreen = document.getElementById('transferScreen');
    const errorScreen = document.getElementById('errorScreen');
    const pinBox = document.getElementById('pinBox');
    const clipText = document.getElementById('clipText');
    const sendBtn = document.getElementById('sendBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const unpairBtn = document.getElementById('unpairBtn');
    const reconnectBtn = document.getElementById('reconnectBtn');

    function showToast(msg, type = 'info') {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.className = 'toast show ' + type;
      setTimeout(() => { toast.className = 'toast'; }, 3000);
    }

    function setStatus(state, text) {
      statusBadge.className = 'status-badge status-' + state;
      statusText.textContent = text;
    }

    async function checkStatus() {
      if (!sessionToken) return;
      try {
        const res = await fetch('/api/status', {
          headers: { 'Authorization': 'Bearer ' + sessionToken }
        });
        if (res.status === 200) {
          const data = await res.json();
          if (data.status === 'connected') {
            if (data.sessionToken) {
              sessionToken = data.sessionToken;
              localStorage.setItem('sourceclip_session_token', sessionToken);
            }
            setStatus('connected', 'Connected');
            approvalScreen.style.display = 'none';
            transferScreen.style.display = 'block';
            errorScreen.style.display = 'none';
          } else if (data.status === 'pending') {
            setStatus('connecting', 'Pending Approval');
            approvalScreen.style.display = 'block';
            transferScreen.style.display = 'none';
            errorScreen.style.display = 'none';
            if (data.pin) pinBox.textContent = data.pin;
          } else {
            handleDisconnected('Pairing expired or rejected');
          }
        } else {
          handleDisconnected('Session ended');
        }
      } catch (err) {
        setStatus('disconnected', 'Network Lost');
      }
    }

    async function initiatePairing() {
      if (!initialToken && !sessionToken) {
        handleDisconnected('No pairing token found. Please scan QR code on PC.');
        return;
      }

      setStatus('connecting', 'Pairing...');
      try {
        const res = await fetch('/api/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: initialToken || sessionToken,
            deviceInfo: navigator.userAgent
          })
        });

        const data = await res.json();
        if (res.status === 200 && data.sessionToken) {
          sessionToken = data.sessionToken;
          localStorage.setItem('sourceclip_session_token', sessionToken);
          if (data.status === 'connected') {
            setStatus('connected', 'Connected');
            approvalScreen.style.display = 'none';
            transferScreen.style.display = 'block';
            errorScreen.style.display = 'none';
            showToast('Paired with PC successfully!', 'success');
          } else {
            setStatus('connecting', 'Pending Approval');
            approvalScreen.style.display = 'block';
            pinBox.textContent = data.pin || '------';
            transferScreen.style.display = 'none';
            errorScreen.style.display = 'none';
          }
          startPolling();
        } else {
          handleDisconnected(data.error || 'Pairing token invalid or expired');
        }
      } catch (err) {
        handleDisconnected('Could not connect to PC. Ensure phone and PC are on the same Wi-Fi.');
      }
    }

    function startPolling() {
      if (pollingInterval) clearInterval(pollingInterval);
      pollingInterval = setInterval(checkStatus, 2500);
    }

    function handleDisconnected(msg) {
      if (pollingInterval) clearInterval(pollingInterval);
      sessionToken = '';
      localStorage.removeItem('sourceclip_session_token');
      setStatus('disconnected', 'Disconnected');
      approvalScreen.style.display = 'none';
      transferScreen.style.display = 'none';
      errorScreen.style.display = 'block';
      document.getElementById('errorMsg').textContent = msg;
    }

    // Send content
    sendBtn.addEventListener('click', async () => {
      const text = clipText.value.trim();
      if (!text) {
        showToast('Please enter or paste text to send', 'error');
        return;
      }
      if (text.length > 65536) {
        showToast('Text too large (max 64KB)', 'error');
        return;
      }

      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';

      try {
        const res = await fetch('/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionToken
          },
          body: JSON.stringify({ text })
        });

        const data = await res.json();
        if (res.status === 200 && data.success) {
          showToast('Sent to PC clipboard!', 'success');
          clipText.value = '';
        } else {
          showToast(data.error || 'Failed to send', 'error');
          if (res.status === 401 || res.status === 403) {
            handleDisconnected('Pairing invalidated');
          }
        }
      } catch (err) {
        showToast('Network error while sending to PC', 'error');
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '🚀 Send to PC';
      }
    });

    // Paste button
    pasteBtn.addEventListener('click', async () => {
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            clipText.value = text;
            showToast('Pasted from phone clipboard');
          }
        } catch (e) {
          showToast('Clipboard access denied. Long-press to paste manually.');
        }
      } else {
        showToast('Long-press textarea to paste.');
      }
    });

    // Unpair
    unpairBtn.addEventListener('click', async () => {
      if (confirm('Disconnect from this PC?')) {
        try {
          await fetch('/api/unpair', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + sessionToken }
          });
        } catch (e) {}
        handleDisconnected('You have disconnected from the PC.');
      }
    });

    reconnectBtn.addEventListener('click', () => {
      window.location.reload();
    });

    // Initialize
    initiatePairing();
  </script>
</body>
</html>`;

export class BridgeServer {
  private server: http.Server | null = null;
  private port = 32123;
  private currentIp = '';
  private pairingSecret = '';
  private currentPin = '';
  private activeSessionToken = '';
  private pendingRequest: PairingRequest | null = null;
  private connectedDevice: {
    ip: string;
    deviceInfo: string;
    pairedAt: number;
  } | null = null;

  // Rate limiting (max 30 sends per minute)
  private sendCounts: { count: number; resetTime: number } = { count: 0, resetTime: Date.now() + 60000 };

  private onStatusChangeCallbacks: ((status: BridgeStatus) => void)[] = [];
  private onPairingRequestCallbacks: ((req: PairingRequest) => void)[] = [];
  private onContentReceivedCallbacks: ((text: string, ip: string) => void)[] = [];

  constructor() {
    this.refreshLocalIps();
  }

  public getAvailableIps(): NetworkInterfaceInfo[] {
    const interfaces = os.networkInterfaces();
    const list: NetworkInterfaceInfo[] = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        // Only accept IPv4 non-internal addresses
        if (addr.family === 'IPv4' && !addr.internal) {
          // Check for private network ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
          if (this.isPrivateIp(addr.address)) {
            list.push({
              name,
              address: addr.address,
              family: addr.family
            });
          }
        }
      }
    }

    // Sort to prioritize Wi-Fi/Wireless and Ethernet
    return list.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aIsWifi = aName.includes('wi-fi') || aName.includes('wlan') || aName.includes('wireless');
      const bIsWifi = bName.includes('wi-fi') || bName.includes('wlan') || bName.includes('wireless');
      if (aIsWifi && !bIsWifi) return -1;
      if (!aIsWifi && bIsWifi) return 1;
      return 0;
    });
  }

  private isPrivateIp(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return false;
    // 10.0.0.0 - 10.255.255.255
    if (parts[0] === 10) return true;
    // 172.16.0.0 - 172.31.255.255
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0 - 192.168.255.255
    if (parts[0] === 192 && parts[1] === 168) return true;
    return false;
  }

  private refreshLocalIps() {
    const ips = this.getAvailableIps();
    if (ips.length > 0) {
      if (!this.currentIp || !ips.some(i => i.address === this.currentIp)) {
        this.currentIp = ips[0].address;
      }
    } else {
      this.currentIp = '127.0.0.1';
    }
  }

  public setSelectedIp(ip: string) {
    this.currentIp = ip;
    this.emitStatus();
  }

  public start(port = 32123): Promise<BridgeStatus> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        return resolve(this.getStatus());
      }

      this.port = port;
      this.refreshLocalIps();
      this.generateNewPairingCredentials();

      this.server = http.createServer((req, res) => {
        this.handleHttpRequest(req, res);
      });

      // Bind to 0.0.0.0 so phone on LAN can reach the desktop IP
      this.server.listen(this.port, '0.0.0.0', () => {
        this.emitStatus();
        resolve(this.getStatus());
      });

      this.server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          // Retry with ephemeral port if default port is in use
          this.port = 0;
          this.server?.listen(0, '0.0.0.0', () => {
            const addr = this.server?.address();
            if (addr && typeof addr === 'object') {
              this.port = addr.port;
            }
            this.emitStatus();
            resolve(this.getStatus());
          });
        } else {
          this.stop();
          reject(err);
        }
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          this.activeSessionToken = '';
          this.pendingRequest = null;
          this.connectedDevice = null;
          this.emitStatus();
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public generateNewPairingCredentials() {
    this.pairingSecret = crypto.randomBytes(16).toString('hex');
    // 6-digit verification PIN
    this.currentPin = Math.floor(100000 + Math.random() * 900000).toString();
    this.activeSessionToken = '';
    this.pendingRequest = null;
    this.connectedDevice = null;
  }

  public approvePairing(requestId: string): boolean {
    if (this.pendingRequest && this.pendingRequest.id === requestId) {
      // Issue authorized session token
      this.activeSessionToken = crypto.randomBytes(24).toString('hex');
      this.connectedDevice = {
        ip: this.pendingRequest.ip,
        deviceInfo: this.pendingRequest.deviceInfo,
        pairedAt: Date.now()
      };
      this.pendingRequest = null;
      this.emitStatus();
      return true;
    }
    return false;
  }

  public rejectPairing(requestId: string): boolean {
    if (this.pendingRequest && this.pendingRequest.id === requestId) {
      this.pendingRequest = null;
      this.emitStatus();
      return true;
    }
    return false;
  }

  public unpairDevice(): void {
    this.activeSessionToken = '';
    this.connectedDevice = null;
    this.pendingRequest = null;
    this.generateNewPairingCredentials();
    this.emitStatus();
  }

  public getStatus(): BridgeStatus {
    const isRunning = this.server !== null && this.server.listening;
    const pairingUrl = isRunning && this.currentIp
      ? `http://${this.currentIp}:${this.port}/?token=${this.pairingSecret}`
      : '';

    return {
      isRunning,
      port: this.port,
      selectedIp: this.currentIp,
      availableIps: this.getAvailableIps(),
      pairingUrl,
      pin: this.currentPin,
      connectedDevice: this.connectedDevice,
      pendingRequest: this.pendingRequest
    };
  }

  public onStatusChange(callback: (status: BridgeStatus) => void) {
    this.onStatusChangeCallbacks.push(callback);
  }

  public onPairingRequest(callback: (req: PairingRequest) => void) {
    this.onPairingRequestCallbacks.push(callback);
  }

  public onContentReceived(callback: (text: string, ip: string) => void) {
    this.onContentReceivedCallbacks.push(callback);
  }

  private emitStatus() {
    const status = this.getStatus();
    for (const cb of this.onStatusChangeCallbacks) {
      try { cb(status); } catch (e) {}
    }
  }

  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const remoteIp = req.socket.remoteAddress || '';
    
    // Set Private Network Access and security headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // 1. Serve Mobile Web Client
    if (req.method === 'GET' && pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(MOBILE_CLIENT_HTML);
      return;
    }

    // 2. Health & Status check
    if (req.method === 'GET' && pathname === '/api/status') {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (this.activeSessionToken && (token === this.activeSessionToken || token === this.pairingSecret)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'connected',
          sessionToken: this.activeSessionToken,
          device: this.connectedDevice
        }));
        return;
      }

      if (this.pendingRequest && token === this.pairingSecret) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'pending',
          pin: this.currentPin
        }));
        return;
      }

      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized or session expired' }));
      return;
    }

    // 3. Initiate Pairing Request
    if (req.method === 'POST' && pathname === '/api/pair') {
      this.readJsonBody(req, res, 4096, (data) => {
        const token = data?.token;
        const deviceInfo = String(data?.deviceInfo || 'Unknown Browser').slice(0, 120);

        if (!token || (token !== this.pairingSecret && token !== this.activeSessionToken)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid pairing token. Please scan the QR code again.' }));
          return;
        }

        // If this device was already approved / paired
        if (this.activeSessionToken && (token === this.activeSessionToken || token === this.pairingSecret)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'connected',
            sessionToken: this.activeSessionToken
          }));
          return;
        }

        // New pairing attempt: create pending request
        const requestId = crypto.randomBytes(8).toString('hex');
        this.pendingRequest = {
          id: requestId,
          deviceInfo: this.cleanUserAgent(deviceInfo),
          ip: remoteIp.replace(/^.*:/, ''),
          pin: this.currentPin,
          timestamp: Date.now()
        };

        this.emitStatus();
        for (const cb of this.onPairingRequestCallbacks) {
          try { cb(this.pendingRequest); } catch (e) {}
        }

        // Respond with pending status and temporary token to poll
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'pending',
          sessionToken: this.pairingSecret,
          pin: this.currentPin
        }));
      });
      return;
    }

    // 4. Send Content (Text/Link)
    if (req.method === 'POST' && pathname === '/api/send') {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (!this.activeSessionToken || token !== this.activeSessionToken) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Device is not paired or authorization expired' }));
        return;
      }

      // Check rate limit (max 30 requests per minute)
      const now = Date.now();
      if (now > this.sendCounts.resetTime) {
        this.sendCounts = { count: 0, resetTime: now + 60000 };
      }
      this.sendCounts.count++;
      if (this.sendCounts.count > 30) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute.' }));
        return;
      }

      // Max size: 64 KB (65,536 bytes)
      this.readJsonBody(req, res, 65536, (data) => {
        const text = data?.text;
        if (typeof text !== 'string' || !text.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid or empty content' }));
          return;
        }

        // Emit content to listeners (never executed, strictly stored as text)
        for (const cb of this.onContentReceivedCallbacks) {
          try { cb(text, remoteIp); } catch (e) {}
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, length: text.length }));
      });
      return;
    }

    // 5. Unpair Device
    if (req.method === 'POST' && pathname === '/api/unpair') {
      this.unpairDevice();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // 404 Not Found for any other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }

  private cleanUserAgent(ua: string): string {
    if (ua.includes('Android')) {
      const match = ua.match(/Android\s+([0-9.]+)?/);
      const chromeMatch = ua.match(/Chrome\/([0-9.]+)/);
      return `Android Device ${match ? match[0] : ''} (${chromeMatch ? 'Chrome' : 'Mobile Browser'})`;
    }
    if (ua.includes('iPhone') || ua.includes('iPad')) {
      return 'iOS Device (Safari)';
    }
    return ua.slice(0, 40);
  }

  private readJsonBody(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    maxBytes: number,
    onSuccess: (data: any) => void
  ) {
    let body = '';
    let bytesReceived = 0;

    req.on('data', (chunk) => {
      bytesReceived += chunk.length;
      if (bytesReceived > maxBytes) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Payload too large (limit ${maxBytes / 1024}KB)` }));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        onSuccess(parsed);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
      }
    });
  }
}

export const bridgeServer = new BridgeServer();
