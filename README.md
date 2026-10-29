# SourceClip 📋

> **Lightweight, Privacy-First Clipboard Manager & Same-Wi-Fi Phone-to-PC Bridge for Windows**

SourceClip is an open-source, minimalist Windows desktop application designed to capture your clipboard history locally, preserve pinned favorites, and seamlessly share text and links from any Android phone to your PC over your local Wi-Fi network without cloud accounts or third-party servers.

---

## ✨ Features (Version 1.0)

### 1. 📋 Minimalist Clipboard History
- **Automatic Background Capture**: Captures copied text and links instantly with negligible CPU footprint.
- **Pin to Top**: Star important snippets, code blocks, or templates to keep them pinned permanently.
- **Search & Filter**: Search through your history in real-time or filter by pinned snippets.
- **One-Click Copy with Feedback**: Instant visual confirmation (`Copied!`) when copying items back to your system clipboard.
- **Character & Word Counter**: View character counts, word counts, and relative timestamps (`Just now`, `5m ago`, `Oct 29`).
- **Clean Responsive UI**: Fluid layout that scales from a compact 340px desktop utility window to full-screen.
- **Bilingual Interface**: Full native support for **English** and **Sinhala (සිංහල)**.
- **100% Local Persistence**: Uses SQLite WAL mode stored in your Windows user profile (`%APPDATA%\sourceclip`).

### 2. 📱 SourceClip Bridge (Phone-to-PC Sharing)
- **Zero-Install Phone Client**: No Android APK required! Simply scan the desktop QR code using your phone's camera or mobile browser (Chrome/Firefox/Samsung Internet).
- **Same-Wi-Fi Local Transfer**: Send links, notes, OTPs, or text directly from your phone to your PC.
- **Explicit Pairing & Security**: Each session generates a unique cryptographic token and a 6-digit PIN. Transfers are **blocked** until you click **Approve** on your desktop.
- **Item Attribution**: Content received from your phone is tagged with a distinct `📱 Phone` badge in your history.
- **Strict Size Limits & Rate Limiting**: Up to 64 KB per payload with protection against local network flooding.
- **No Cloud, No Telemetry**: All traffic remains inside your local Wi-Fi network.

---

## 🚀 Quick Start & Installation

### Option A: Windows Installer
Download the latest installer from the `release/` directory:
- **`release/sourceclip Setup 1.0.0.exe`**
- Runs as a standard Windows user app (installed to `%LOCALAPPDATA%\Programs\sourceclip`), requiring no administrative elevation or UAC prompts.

### Option B: Portable Unpacked
Run directly without installing:
- **`release/win-unpacked/sourceclip.exe`**

---

## 🛠️ Developer Setup & Build

### Prerequisites
- Node.js 18+ or 20+
- npm (or pnpm)
- Windows 10 / 11

### Commands
```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev

# Run automated Bridge integration test suite (17 tests)
npm test

# Build production bundle and Windows NSIS installer
npm run build
```

---

## 📱 How to Use SourceClip Bridge

1. Connect both your PC and Android phone to the **same Wi-Fi router**.
2. In SourceClip on desktop, click the **`📱 Bridge`** button in the top header.
3. Click **"Turn On"** to start the local Bridge server.
4. Scan the displayed **QR Code** using your phone camera or mobile browser.
5. On your PC, a **"Phone Pairing Request"** prompt will appear showing the device name, IP, and PIN. Click **"Approve"**.
6. On your phone, type or paste any text/link and tap **"🚀 Send to PC"**.
7. The snippet appears immediately in your desktop clipboard history ready to copy!

---

## 📁 Project Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - System architecture, process isolation, data flow, and Bridge HTTP engine.
- [`SECURITY.md`](./SECURITY.md) - Security threat model, local-network restrictions, authentication, and input validation.
- [`TESTING.md`](./TESTING.md) - Automated test suite results, manual verification cases, and troubleshooting.
- [`CHANGELOG.md`](./CHANGELOG.md) - Release history and version notes.
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) - Version 1.0 release readiness and Version 2.0 roadmap.

---

## 📄 License
MIT License. Free and open source.
