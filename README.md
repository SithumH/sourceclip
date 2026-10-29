# SourceClip 📋

> **Lightweight, Privacy-First Clipboard Manager & Same-Wi-Fi Bidirectional Phone-PC Bridge for Windows**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/SithumH/sourceclip/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-0078D6.svg?logo=windows)](https://github.com/SithumH/sourceclip)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-27%2F27%20passed-brightgreen.svg)](TESTING.md)
[![Privacy](https://img.shields.io/badge/privacy-100%25%20Local%20%7C%20Zero%20Cloud-success.svg)](SECURITY.md)
[![Electron](https://img.shields.io/badge/Electron-32.0.1-47848F.svg?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57.svg?logo=sqlite)](https://github.com/WiseLibs/better-sqlite3)

---

## 📖 Overview

**SourceClip** is a fast, minimalist, and privacy-respecting Windows desktop utility built for developers, writers, students, and everyday power users. It unobtrusively monitors your system clipboard, preserves your frequently used snippets, and introduces **SourceClip Bridge**—a local Wi-Fi technology that allows you to instantly share text and links **bidirectionally between your PC and Android phone** without installing any mobile apps, creating accounts, or sending data to external cloud servers.

Everything you copy stays strictly on your local machine and your private local network.

---

## ✨ Complete Feature Breakdown (Version 1.0)

### 1. 📋 Desktop Clipboard History Management
* **Automatic Background Capture**: Monitors your Windows clipboard every 500ms with negligible CPU footprint (< 0.2% CPU at idle). Captures copied text, links, code snippets, and notes seamlessly.
* **Pin / Favorite to Top**: Pin important code snippets, canned email responses, commands, or notes to keep them permanently docked at the top with a distinctive amber highlight.
* **Real-Time Instant Search**: Live substring search filtering across your entire clipboard history as you type.
* **Category Tabs**: Switch between **All** items and **Pinned** favorites with one click.
* **1-Click Copy with Animated Feedback**: Click **Copy** on any snippet to immediately write it to your Windows system clipboard with a 1.4-second `Copied!` green confirmation badge.
* **Character & Word Counters**: Each snippet card displays exact character and word counts so you know payload lengths before pasting.
* **Relative Timestamps**: Human-readable relative time badges (`Just now`, `5m ago`, `2h ago`, or formatted calendar dates).
* **Full Snippet Inspector Modal**: Click on any card to view the entire text in a comfortable modal dialog with `pre-wrap` formatting, word wrap, user-selectable text, and `Escape` keyboard dismissal.
* **Single & Bulk Deletion**: Delete individual snippets with a single click, or clear all unpinned items in one step with a safety confirmation prompt. Pinned items are never deleted during bulk cleanup.
* **Automatic 7-Day Pruning**: Automatically prunes unpinned items older than 7 days on application launch to keep the local SQLite database fast and lightweight.
* **Single-Instance Process Lock**: Built-in Windows mutex lock (`app.requestSingleInstanceLock()`) ensures only one instance of SourceClip runs at a time, bringing the existing window into focus if launched again.

---

### 2. 📱 SourceClip Bridge (Bidirectional PC ⇄ Phone Sharing)
* **Zero-Install Phone Client**: No Android APK required! Simply scan the QR code displayed on your PC screen using your phone's native camera, Google Lens, or mobile browser (Chrome, Firefox, Edge, Samsung Internet).
* **Two-Way Local Transfer**:
  * **Phone ➔ PC**: Paste links, long texts, or two-factor authentication (2FA) OTP codes in your mobile browser and tap **"🚀 Send to PC"**—it appears immediately in your desktop clipboard history with a blue `📱 Phone` badge!
  * **PC ➔ Phone**: Click the **`📱 Send to Phone`** icon on any clipboard card, inside the full snippet preview modal, or type/paste directly into the Bridge modal to instantly deliver text to your connected phone.
* **Mobile Real-Time Feed**: Received PC snippets appear automatically in the phone's **"📥 Received from PC"** section without refreshing.
* **1-Tap Phone Clipboard Copy**: Each incoming message on your phone features a 1-tap **"📋 Copy"** button with haptic vibration feedback (`navigator.vibrate`) and instant visual confirmation (`✓ Copied!`).
* **Smart Link Opener**: If the content is a web address (`http://` or `https://`), the phone displays an **"Open Link ↗"** button that launches the destination directly in a new tab.
* **Standard ISO/IEC 18004 QR Code**: Uses a mathematically compliant ISO 18004 QR matrix engine with 15-bit BCH error correction and a standard 4-module quiet zone, readable by all mobile cameras and QR scanner apps.
* **Matching 6-Digit PIN Verification**: Displays a matching 6-digit PIN on both your PC and phone screen to prevent rogue pairing attempts.
* **Mandatory Desktop User Approval**: Pairing requests are held in a pending state until you explicitly click **"Approve"** on your desktop app. Unapproved devices cannot send or receive clipboard data.
* **Cryptographic Session Tokens**: Authorized devices are issued a secure 24-byte cryptographic session Bearer token stored only in the phone's local session storage.
* **Multi-Network Interface Selector**: If your PC has multiple network cards (Wi-Fi, Ethernet, Hotspot, VPN), SourceClip lets you select the exact active Wi-Fi IP from a convenient dropdown.
* **Dynamic Port Allocation**: Defaults to port `32123`, with automatic fallback to an ephemeral dynamic port if the default port is occupied.
* **Instant Disconnect / Unpair**: Disconnect from either the PC app or the mobile browser at any time to immediately invalidate session tokens.

---

### 3. 🔒 Privacy & Security by Design
* **100% Local Network Isolation**: All communication occurs exclusively over your local Wi-Fi network (RFC 1918 private IPv4 ranges: `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`).
* **Zero Cloud / Zero Telemetry**: Absolutely no telemetry, analytics, third-party trackers, or external cloud servers are used.
* **Passive String Storage Only**: All content received from the phone is strictly stored as passive UTF-8 text in the SQLite database. **SourceClip will never execute received text, evaluate scripts, or run OS shell commands.**
* **Complete HTML Escaping**: Mobile client sanitizes and escapes all incoming text before rendering to prevent Cross-Site Scripting (XSS).
* **Strict Payload Size Limits**: Hard limit of **64 KB** (65,536 bytes) per transfer prevents memory exhaustion and network spam.
* **Rate-Limiting Protection**: Both sending and receiving endpoints enforce a maximum of 30 requests per minute per client IP.
* **Electron Security Hardening**: Renderer runs with `contextIsolation: true` and `nodeIntegration: false`. Only explicit, strictly typed IPC methods are exposed through `electron/preload.ts`.

---

### 4. 🎨 Modern Minimalist UI & User Experience
* **Bilingual Interface**: Native, switchable bilingual support for **English** and **Sinhala (සිංහල)** with a one-click header pill.
* **Fluid Responsive CSS Grid**: Built using dynamic CSS Grid (`repeat(auto-fill, minmax(250px, 1fr))`) that smoothly reflows from a compact 340px desktop utility window to ultra-wide displays.
* **Crisp Vector SVG Icons**: Zero external icon fonts or bulky font libraries; all icons are rendered as razor-sharp SVG vector elements that look flawless on High-DPI and 4K monitors.
* **Custom Micro Scrollbars**: Ultra-slim 5px custom scrollbars that preserve screen real estate.
* **Dark-Accented Status Indicators**: Clear color-coded badges for Bridge status (`Off`, `Waiting for scan`, `Connected`).

---

## 🏛️ System Architecture

```
+-------------------------------------------------------------------------+
|                        WINDOWS OPERATING SYSTEM                         |
+-------------------------------------------------------------------------+
       |                                                    |
       v                                                    v
[System Clipboard]                                [Local Wi-Fi Network]
       |                                                    |
       v                                                    v
+-------------------------------------------------------------------------+
|                         ELECTRON MAIN PROCESS                           |
|                                                                         |
|  +---------------------+   +-------------------+   +-----------------+  |
|  | Clipboard Monitor   |   | SQLite Database   |   | Bridge Server   |  |
|  | (500ms watcher)     |   | (WAL Mode, C++)   |   | (Node.js HTTP)  |  |
|  +---------------------+   +-------------------+   +-----------------+  |
|             \                       |                       /           |
|              +----------------------+----------------------+            |
|                                     |                                   |
|                        IPC Handlers (ipcMain)                           |
+-------------------------------------------------------------------------+
                                      |
                           contextBridge (preload.mjs)
                                      |
+-------------------------------------------------------------------------+
|                       RENDERER PROCESS (Chromium)                       |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | React 18 Application (Vite 5 Bundled)                             |  |
|  |  * Header, Search Bar, Category Filters                           |  |
|  |  * Responsive Clipboard Cards Grid                                |  |
|  |  * Full Snippet Preview Modal                                     |  |
|  |  * Bridge QR Code Modal & Direct PC-to-Phone Sender               |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                      ^
                                      |  Local Wi-Fi (HTTP / REST)
                                      v
+-------------------------------------------------------------------------+
|                 MOBILE CLIENT (Android Phone Browser)                   |
|  * Embedded Web App served from Bridge HTTP server                      |
|  * Share to PC form & Paste helper                                      |
|  * Real-time "Received from PC" feed with 1-Tap Copy & Open Link        |
+-------------------------------------------------------------------------+
```

---

## 💻 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Desktop Shell** | [Electron 32](https://www.electronjs.org/) | Cross-process architecture with secure context isolation |
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) | Component-driven UI with strict type safety |
| **Bundler & Tooling** | [Vite 5](https://vitejs.dev/) | Lightning-fast HMR and optimized production builds |
| **Local Database** | [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) | Native synchronous SQLite C++ driver with WAL mode |
| **Bridge Engine** | Node.js `http` & `os` | Zero-dependency local network HTTP server |
| **QR Code Engine** | Pure TypeScript / JS | Standard ISO/IEC 18004 QR matrix generator |
| **Installer** | NSIS via `electron-builder` | Lightweight user-level Windows installer |

---

## 📥 Installation

### Option 1: Standard Windows Installer (Recommended)
1. Download the latest installer from the `release/` folder:
   - **`release/sourceclip Setup 1.0.0.exe`**
2. Double-click to run the setup.
3. SourceClip installs to `%LOCALAPPDATA%\Programs\sourceclip` without requiring administrative elevation or UAC prompts.
4. Launch SourceClip from your Start Menu or Desktop shortcut!

### Option 2: Portable Standalone Executable
If you prefer not to install:
1. Navigate to the `release/win-unpacked/` folder.
2. Run **`sourceclip.exe`** directly.

> [!IMPORTANT]
> ### 🛡️ First-Time Launch: Windows SmartScreen ("More info" -> "Run anyway")
> When you or someone else downloads and runs SourceClip on Windows for the first time, Microsoft Defender SmartScreen may display a blue protection dialog:
>
> ```
> Windows protected your PC
> Microsoft Defender SmartScreen prevented an unrecognized app from starting.
> ```
>
> **To start SourceClip:**
> 1. Click **"More info"** (the underlined text beneath the message)
> 2. Click the **"Run anyway"** button that appears at the bottom
>
> **Why does Windows show this?**  
> SourceClip is a 100% free, transparent open-source utility. Windows SmartScreen displays this prompt for any newly released executable that is not signed with an expensive corporate digital certificate ($300–$500/year). SourceClip contains **zero malware, zero adware, and zero telemetry**, and the complete source code is public for anyone to inspect right here on GitHub.
>
> ---
> **සිංහල උපදෙස් (Sinhala Guide):**  
> ඔබ හෝ වෙනත් අයෙකු මෙම ඇප් එක GitHub වෙතින් Download කර මුලින්ම Open කිරීමේදී Windows මඟින් *"Windows protected your PC"* යනුවෙන් නිල් පැහැති SmartScreen පණිවිඩයක් පැමිණියහොත්:  
> 1. එහි ඇති **"More info"** ලින්ක් එක ක්ලික් කරන්න.  
> 2. ඉන්පසු පහළින් මතුවන **"Run anyway"** බොත්තම ක්ලික් කර ඇප් එක විවෘත කරගන්න.  
> *(මෙය මිල අධික වාණිජ Code-Signing සහතිකයක් නොමැති ඕනෑම නව Open-Source මෘදුකාංගයකට Windows ආරක්ෂක පද්ධතිය මඟින් සාමාන්‍යයෙන් පෙන්වන දැනුම්දීමක් පමණක් වන අතර, SourceClip පරිගණකයට 100% ක් ආරක්ෂිත වේ.)*

---

## 📱 How to Use SourceClip Bridge

### Step 1: Turn On the Bridge
1. Make sure your PC and Android phone are connected to the **same Wi-Fi router** (or phone mobile hotspot).
2. Click the **`📱 Bridge`** button in the SourceClip header on your PC.
3. Click **"Turn On"**. SourceClip will start the local Bridge server and display a QR Code along with a 6-digit PIN.

### Step 2: Pair Your Phone
1. Open your phone's camera, Google Lens, or mobile browser.
2. Scan the QR code shown on your PC screen.
3. Your phone will open the SourceClip Bridge web page and display a **6-digit verification code**.
4. Check your PC screen—a **"Phone Pairing Request"** modal will pop up displaying the device name, IP, and matching PIN.
5. Click **"Approve Pairing"** on your PC. Your phone is now paired!

### Step 3: Send Content
* **From Phone to PC**: Type or paste any text or URL in your phone's browser and tap **"🚀 Send to PC"**. It immediately appears at the top of your desktop clipboard list with a `📱 Phone` badge.
* **From PC to Phone**: 
  - Click the **`📱` icon** on any snippet card in your clipboard list.
  - Or open any snippet modal and click **"Send to Phone 📱"**.
  - Or type directly into the "Send Text or Link to Phone" box inside the Bridge modal.
* **On Your Phone**: The snippet appears instantly in the **"📥 Received from PC"** feed. Tap **"📋 Copy"** to copy it straight to your phone's clipboard, or tap **"Open ↗"** to open web links directly!

---

## 🛠️ Developer Setup & Build

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0+ (or pnpm / yarn)
* **OS**: Windows 10 / 11 (x64)

### Setup Instructions
```bash
# 1. Clone the repository
git clone https://github.com/SithumH/sourceclip.git
cd sourceclip

# 2. Install dependencies
npm install

# 3. Run development mode (Vite + Electron with live reload)
npm run dev

# 4. Run automated test suite (27 integration tests)
npm test

# 5. Type-check TypeScript code
npx tsc --noEmit

# 6. Build production package & NSIS installer
npm run build
```

Production build artifacts will be generated in:
* `release/sourceclip Setup 1.0.0.exe` (NSIS Installer)
* `release/win-unpacked/sourceclip.exe` (Standalone unpacked binary)

---

## 🧪 Testing & Verification

SourceClip includes a comprehensive automated test suite in `tests/bridge.test.ts` executed via `npm test`.

```bash
> sourceclip@1.0.0 test
> npx tsx tests/bridge.test.ts

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

[Test 9] PC-to-Phone Sharing (Send from Desktop to Mobile):
  ✓ PC sent message successfully to paired phone
  ✓ PC message ID generated
  ✓ Phone can fetch outgoing messages via GET /api/messages
  ✓ Messages list returned to phone
  ✓ Phone received exact message text
  ✓ GET /api/status delivers messages seamlessly

[Test 10] Security: Reject Unauthorized Access to /api/messages:
  ✓ Unauthorized /api/messages rejected with HTTP 401

[Test 11] Clear Outgoing Messages:
  ✓ Messages cleared via API
  ✓ Message queue is empty after clear

[Test 12] Disconnect & Session Invalidation:
  ✓ Unpair API returned HTTP 200
  ✓ PC cannot send to phone after device is unpaired
  ✓ Subsequent requests with revoked token rejected with HTTP 401

========================================
TEST SUMMARY: 27 passed, 0 failed
========================================
```

---

## 📂 Project Directory Structure

```text
sourceclip/
├── .github/                     # GitHub workflows and issue templates
├── electron/                    # Electron main process source code
│   ├── bridge.ts                # HTTP LAN bridge server & embedded mobile client
│   ├── database.ts              # SQLite WAL configuration, schema & CRUD handlers
│   ├── main.ts                  # Application lifecycle, clipboard watcher, IPC dispatch
│   └── preload.ts               # contextBridge secure IPC interface
├── public/                      # Static assets
│   └── logo.png                 # Application logo & Windows executable icon
├── src/                         # React 18 renderer process source code
│   ├── components/
│   │   └── BridgeModal.tsx      # Bridge control panel, QR code display & direct send UI
│   ├── utils/
│   │   ├── qrcode.ts            # SVG QR Code renderer component
│   │   └── qrcode-generator.js  # Standard ISO/IEC 18004 QR matrix engine
│   ├── App.tsx                  # Main application UI, clipboard list & modal views
│   ├── index.css                # Minimalist design system, CSS grid & animations
│   ├── main.tsx                 # React DOM mount point
│   └── vite-env.d.ts            # TypeScript definitions for Vite
├── tests/                       # Integration test suite
│   └── bridge.test.ts           # 27 automated Bridge security & bidirectional tests
├── ARCHITECTURE.md              # Deep technical architecture & specifications
├── CHANGELOG.md                 # Release notes & changelog history
├── PROJECT_STATUS.md            # Version 1.0 status & Version 2.0 roadmap
├── SECURITY.md                  # Security policies, threat model & disclosure
├── TESTING.md                   # QA manual test matrix & verification logs
├── package.json                 # Project dependencies & build configurations
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite bundler & Electron plugin configuration
```

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><b>1. Why does Windows SmartScreen show "Windows protected your PC"?</b></summary>
<p>Windows Defender SmartScreen shows this prompt on freshly downloaded executable files from the internet if they are not signed with a paid commercial certificate ($300+/year). To run SourceClip, simply click <b>"More info"</b> and then <b>"Run anyway"</b>. SourceClip is 100% open-source, completely clean, and contains no telemetry or malware.</p>
</details>

<details>
<summary><b>2. Do I need to install an app on my Android phone?</b></summary>
<p>No! SourceClip Bridge serves a lightweight, mobile-optimized Web App directly from your PC to your phone's browser. There are no APKs to install and no permissions to grant.</p>
</details>

<details>
<summary><b>3. Does SourceClip send any of my clipboard data to the cloud?</b></summary>
<p>Never. SourceClip is 100% offline-capable and privacy-first. Your clipboard history is saved exclusively in a local SQLite database in your Windows profile (<code>%APPDATA%\sourceclip\clipboard.db</code>). Phone sharing communicates strictly across your local Wi-Fi router.</p>
</details>

<details>
<summary><b>4. Why can't my phone connect to my PC after scanning the QR code?</b></summary>
<p>Ensure that:
<ol>
  <li>Both your PC and phone are connected to the <b>same Wi-Fi router</b> (or your phone's portable hotspot).</li>
  <li>Your Wi-Fi router does not have <b>"AP Client Isolation"</b> enabled (a router setting that blocks devices on the same Wi-Fi from talking to each other).</li>
  <li>Windows Defender / Firewall has allowed SourceClip on <b>Private Networks</b>.</li>
  <li>If your PC has multiple network cards or VPNs active, choose the active Wi-Fi IP address from the dropdown in the Bridge modal.</li>
</ol>
</p>
</details>

<details>
<summary><b>5. How do I switch languages?</b></summary>
<p>Click the <b>EN / සිං</b> toggle pill in the top header. The interface will switch immediately between English and Sinhala (සිංහල).</p>
</details>

<details>
<summary><b>6. How long is my clipboard history kept?</b></summary>
<p>Pinned items are saved permanently until you explicitly unpin or delete them. Unpinned items older than 7 days are automatically pruned when SourceClip starts up to keep your database fast and clean.</p>
</details>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - feel free to use, modify, and distribute it freely.

---

## 👨‍💻 Author & Contributions

Built with ❤️ by **[Sithum Himsara](https://github.com/SithumH)**.  
Contributions, issue reports, and feature suggestions are welcome! If you find SourceClip useful, consider giving it a ⭐ on [GitHub](https://github.com/SithumH/sourceclip).
