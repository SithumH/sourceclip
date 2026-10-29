# SourceClip Project Status & Roadmap

> **Current Release:** Version 1.0.0 (Production Ready)  
> **Date:** October 29, 2026

---

## 1. Version 1.0 Release Readiness Checklist

- [x] **Core Clipboard Management**:
  - [x] Background clipboard capture with negligible overhead.
  - [x] Local SQLite persistence with WAL mode.
  - [x] Pin/unpin items to top of list.
  - [x] Full-text search and filter pills (`All` / `Pinned`).
  - [x] Character count, word count, and relative timestamps.
  - [x] Auto-cleanup of unpinned items older than 7 days.
- [x] **SourceClip Bridge (Bidirectional PC ⇄ Phone Sharing)**:
  - [x] Zero-install mobile Web UI served directly to Android phone browsers.
  - [x] QR code pairing with visual 6-digit PIN.
  - [x] Mandatory explicit user approval prompt on desktop.
  - [x] Cryptographic session Bearer token authentication.
  - [x] Local Wi-Fi network restriction (RFC 1918 private IPv4 validation).
  - [x] Payload limit enforced at 64 KB with rate-limiting (30/min).
  - [x] Passive text storage (no code execution or command evaluation).
  - [x] Live connection status badge and unpair/disconnect controls.
  - [x] Distinct `📱 Phone` badge on received items.
  - [x] Network interface selector for multi-adapter environments.
  - [x] **PC-to-Phone sending**: Send any snippet or custom text directly from PC to phone.
  - [x] **Mobile incoming feed**: View PC items with one-tap Copy to Clipboard and Open Link.
- [x] **Packaging & Distribution**:
  - [x] NSIS user-level installer (`release/sourceclip Setup 1.0.0.exe`).
  - [x] Portable unpacked executable (`release/win-unpacked/sourceclip.exe`).
  - [x] Single-instance process lock preventing duplicate processes or file contention.
  - [x] ASAR unpack configured for native SQLite binaries.
- [x] **Quality Assurance**:
  - [x] Automated test suite: **27 passed, 0 failed** (`npm test`).
  - [x] Zero TypeScript compilation warnings or errors (`npx tsc --noEmit`).
  - [x] Vite production bundle builds in under 300ms.
- [x] **Documentation**:
  - [x] `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `TESTING.md`, `CHANGELOG.md`, `PROJECT_STATUS.md`.

---

## 2. Version 2.0 Roadmap (Future Ideas - Out of Scope for v1.0)

> [!NOTE]
> The features below are strictly reserved for Version 2.0 and are not part of Version 1.0. Version 1.0 is focused on local clipboard history and same-Wi-Fi phone-PC bidirectional sharing.

- **Image & File Snippet Transfer**:
  - Sharing images, screenshots, and small files between phone and PC over the local network.
- **End-to-End Encrypted LAN WebSockets**:
  - Upgrading the transport layer to WebSockets with Web Crypto API ECDH key exchange.
- **Native Android Companion App / Quick Settings Tile**:
  - A lightweight Android service that allows sharing directly from Android's system share sheet without opening a browser.
- **Global Desktop Hotkey (Tray & Quick Popover)**:
  - Global shortcut (e.g. `Ctrl+Shift+V` or `Alt+C`) to open SourceClip as a floating cursor menu anywhere in Windows.
- **System Tray Minimization**:
  - Running quietly in the Windows system notification area on window close.
- **Dark Mode Theme**:
  - Sleek dark theme toggle matching Windows system theme preference.

