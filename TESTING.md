# SourceClip Testing & Quality Assurance

> **Version:** 1.0.0  
> **Test Harness:** Node.js native test runner via `tsx tests/bridge.test.ts`

---

## 1. Automated Test Suite

An automated integration and security test suite is located at [`tests/bridge.test.ts`](./tests/bridge.test.ts) and can be executed via:

```bash
npm test
```

### Verified Test Cases (17/17 Passed)

```
--- Starting SourceClip Bridge Automated Test Suite ---

[Test 1] Serves Mobile Web UI over HTTP:
  ✓ GET / returns HTTP 200
  ✓ Serves mobile client HTML

[Test 2] Security: Reject Invalid Pairing Token:
  ✓ Invalid token rejected with HTTP 403 Forbidden

[Test 3] Initiate Valid Pairing & Receive Pending Status:
  ✓ Pairing request accepted with HTTP 200
  ✓ Status is pending user approval
  ✓ PC received pairing event callback
  ✓ PIN matches desktop display

[Test 4] Security: Content Transfer Blocked Before Approval:
  ✓ Unauthorized send rejected with HTTP 401

[Test 5] Explicit User Approval Flow:
  ✓ Desktop user successfully approved pairing request
  ✓ Session authentication token issued
  ✓ Device is confirmed connected

[Test 6] Successful Text & Link Transfer:
  ✓ HTTP 200 returned on valid send
  ✓ Desktop received exact content

[Test 7] Security: Payload Size Limits (> 64KB):
  ✓ Payload > 64KB rejected with HTTP 413 Payload Too Large

[Test 8] Input Validation: Empty / Non-string Text:
  ✓ Whitespace/empty text rejected with HTTP 400

[Test 9] Disconnect & Session Invalidation:
  ✓ Unpair API returned HTTP 200
  ✓ Subsequent requests with revoked token rejected with HTTP 401

========================================
TEST SUMMARY: 17 passed, 0 failed
========================================
```

---

## 2. Manual Verification Checklist

| Scenario | Steps | Expected Outcome | Result |
| :--- | :--- | :--- | :--- |
| **Clipboard Copy & Paste** | Copy text from browser/editor (`Ctrl+C`) | App adds snippet to top of history; text displays cleanly with char count | **PASS** |
| **Pin / Unpin** | Click star icon on card | Pinned card moves to top with amber border; stays pinned after restart | **PASS** |
| **Search Functionality** | Type keyword in search box | Real-time filtering matching keyword; "X" button clears query | **PASS** |
| **QR Code Rendering** | Turn on Bridge from header | Crisp, readable QR code rendered in SVG format without external packages | **PASS** |
| **Mobile Web App Loading** | Scan QR code on Android phone | Mobile browser opens `http://<IP>:<PORT>/?token=...` and displays clean UI | **PASS** |
| **Pairing Approval Prompt** | Mobile initiates connection | Desktop pops up modal with device info, IP, and PIN | **PASS** |
| **Phone-to-PC Text Sharing** | Enter text on phone and tap "Send" | Text instantly appears in desktop history with `📱 Phone` badge | **PASS** |
| **Network Interface Switching** | Multiple IPs present; switch dropdown | QR code regenerates with selected network interface IP | **PASS** |
| **Disconnect & Reconnection** | Click "Disconnect" on either PC or phone | Session is invalidated; phone transitions to Disconnected screen | **PASS** |
| **Installer Finish Launch** | Run installer and click Finish with "Run application" checked | Launches immediately without any "Not Responding" freeze | **PASS** |

---

## 3. Network & Environment Troubleshooting

1. **AP Client Isolation**:
   - Some public Wi-Fi networks (cafes, universities, airports) or guest SSIDs enable "Client Isolation" on the router, which blocks Wi-Fi devices from communicating with one another.
   - *Fix:* Ensure both devices are on a home/office private network where device-to-device communication is permitted.
2. **Windows Firewall Prompt**:
   - On initial launch, Windows Defender Firewall may prompt to allow `sourceclip.exe` access.
   - *Fix:* Select "Private networks (home or work network)" and click "Allow access".
3. **Multiple Network Adapters**:
   - Virtual machines (Hyper-V, VirtualBox, WSL) or VPN adapters often create virtual IPs (e.g. `172.x.x.x` or `192.168.56.x`).
   - *Fix:* Use the **Wi-Fi / Network Interface** dropdown in the Bridge dialog to select your physical Wi-Fi adapter's IP address.

