# SourceClip Security & Privacy Architecture

> **Security Baseline:** SourceClip Version 1.0  
> **Privacy Principle:** 100% Local Data. Zero Cloud Telemetry. Zero Remote Execution.

---

## 1. Threat Model & Safeguards

| Threat Vector | Risk Description | SourceClip Mitigation |
| :--- | :--- | :--- |
| **Public Internet Exposure** | Unauthorized external entities querying the local HTTP port | The Bridge server only accepts connections from RFC 1918 private IPv4 ranges (`192.168.x.x`, `10.x.x.x`, `172.16.x.x - 172.31.x.x`) and `127.0.0.1`. No UPnP or NAT-PMP port forwarding is used. |
| **Unauthorized Local Network Access** | A rogue device on the same Wi-Fi scanning ports and pushing spam or malicious strings | **Explicit Dual-Factor Pairing**: Requires scanning a cryptographically random secret token (`crypto.randomBytes(16)`) and matching a 6-digit visual PIN, followed by explicit manual approval from the PC user. Unapproved requests are rejected with `HTTP 401/403`. |
| **Arbitrary Code Execution** | Attempting to pass shell commands or script injections to execute on PC | **Passive Text Storage Guarantee**: Received data is strictly stored as passive text data in the SQLite database and rendered safely through React's auto-escaping. It is never evaluated, passed to `exec`/`spawn`, or executed by the shell. |
| **Memory Exhaustion / DoS** | Flooding the endpoint with massive payloads | Strict request-body parsing limit of **64 KB** (`65,536 bytes`). Streams exceeding this threshold are immediately destroyed with `HTTP 413 Payload Too Large`. |
| **Local Network Flooding / Rate Limiting** | Spamming thousands of requests per second from a paired phone | Rate limiter restricts each paired session to a maximum of **30 transfer operations per minute**. Exceeding requests receive `HTTP 429 Too Many Requests`. |
| **Cross-Site Request Forgery (CSRF)** | A malicious website in another browser tab sending background POST requests to the PC | Requests enforce Bearer token authentication and modern browser **Private Network Access (PNA)** preflight headers (`Access-Control-Allow-Private-Network`). Browsers disallow public origin cross-network calls. |
| **Data Leakage / Telemetry** | Sending clipboard contents or usage metrics to external servers | **Zero External Connections**: SourceClip contains no analytics, tracking SDKs, cloud sync APIs, or third-party web calls. All data resides on the user's hard drive. |

---

## 2. Authentication & Pairing Lifecycle

```
[Phone Scans QR] ──> (POST /api/pair with Secret)
                            │
                            ▼
              ┌───────────────────────────┐
              │ State: PENDING APPROVAL   │
              │ Displays PIN: 492-184     │
              └───────────────────────────┘
                            │
                User clicks "Approve" on PC
                            │
                            ▼
              ┌───────────────────────────┐
              │ State: CONNECTED          │
              │ Issues 24-byte Bearer Key │
              └───────────────────────────┘
                            │
                Subsequent POST /api/send
                Must include Authorization: Bearer <Key>
```

1. **Initial Secret**: Generated using `crypto.randomBytes(16)` when the Bridge is turned on. Encoded in the QR code.
2. **Pending State**: The phone issues `POST /api/pair`. The desktop triggers an event displaying the device's IP, browser name, and 6-digit PIN.
3. **Session Token**: Only upon user approval does the PC issue an authorized 24-byte session token (`crypto.randomBytes(24)`).
4. **Revocation**: Clicking "Disconnect" on either the phone or PC invalidates the session token instantly. Future calls with that token fail with `401 Unauthorized`.

---

## 3. Sandboxing & Process Security

- **Context Isolation**: Enabled (`contextIsolation: true`) in Electron's `webPreferences`.
- **Node Integration**: Explicitly disabled (`nodeIntegration: false`) in renderer.
- **Process Lock**: Single instance lock (`app.requestSingleInstanceLock()`) ensures rogue secondary processes cannot lock the SQLite database or intercept IPC.
- **ASAR Integrity**: Built with electron-builder ASAR integrity validation enabled.

---

## 4. Reporting a Security Issue
If you discover a potential security vulnerability in SourceClip, please report it via the project's repository issue tracker or directly to the development maintainer.

