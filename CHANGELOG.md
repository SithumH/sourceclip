# Changelog

All notable changes to the **SourceClip** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-29

### Added
- **SourceClip Bridge (Phone-to-PC Sharing)**:
  - Local HTTP Bridge server listening on private Wi-Fi interfaces.
  - Zero-install mobile Web Client served directly to Android phone browsers.
  - Instant pairing via QR Code and matching 6-digit verification PIN.
  - Mandatory explicit user approval workflow on Desktop before accepting any incoming connection.
  - Bearer token session authentication for all content transmissions.
  - Safe text and link transfer with strict 64 KB request size limits and rate limiting (30 requests/min).
  - Clear item attribution in clipboard history with a distinct `📱 Phone` badge.
  - Live connection status indicators (`Off`, `Waiting for scan`, `Connected`).
  - Network interface selector to choose between Wi-Fi, Ethernet, and virtual adapters.
  - Disconnect and session revocation controls on both mobile and desktop.
  - Pure TypeScript zero-dependency QR Code generator (`src/utils/qrcode.ts`).
  - Automated integration test suite (`tests/bridge.test.ts`) covering 17 security and transfer scenarios.
- **Minimalist Modern UI Redesign**:
  - Replaced emojis with crisp, professional SVG vector icons (Search, Close, Copy, Check, Star, Trash, Empty Inbox).
  - Fluid responsive CSS Grid (`repeat(auto-fill, minmax(250px, 1fr))`) that smoothly adapts from compact 340px desktop utilities to full-screen desktop widths.
  - Visual copy feedback: 1.4-second `Copied!` transition with green checkmark.
  - Relative time formatting (`Just now`, `5m ago`, `2h ago`, `Oct 29`).
  - Character and word count indicators.
  - Full-text snippet preview modal with backdrop blur and keyboard shortcut (`Escape` to close).
  - Filter pills for `All` and `Pinned` snippets.
  - Bilingual interface support: English and Sinhala (සිංහල).
  - Ultra-slim custom scrollbars.
- **Comprehensive Project Documentation**:
  - Created `ARCHITECTURE.md`, `SECURITY.md`, `TESTING.md`, `CHANGELOG.md`, and `PROJECT_STATUS.md`.

### Fixed
- **Packaging ASAR Exclusion Bug**:
  - Fixed an issue where electron-builder excluded the frontend `dist/` folder when output was set to `dist/`, causing a blank white screen on packaged app launch. Output redirected to `release/` with explicit file glob inclusion (`dist/**/*`, `dist-electron/**/*`, `public/**/*`).
- **`__dirname` ReferenceError in ES Module Scope**:
  - Fixed bundling bug with `better-sqlite3` being inlined by Vite in ESM context by externalizing it in `vite.config.ts` and using `createRequire(import.meta.url)`.
- **First-Run SQLite Directory Crash**:
  - Added recursive directory creation (`fs.mkdirSync(dbDir, { recursive: true })`) before opening SQLite database in user profile directory (`AppData/Roaming/sourceclip`).
- **Installer Freeze on Finish Screen**:
  - Resolved NSIS UAC elevation deadlock when running with "Run application" checked by setting `perMachine: false`, enabling `allowElevation: true`, and implementing `app.requestSingleInstanceLock()`.

