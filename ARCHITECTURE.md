# SourceClip Architecture & Technical Specification

> **Version:** 1.0.0  
> **Platform:** Windows (Electron 32, React 18, Vite 5, Better-SQLite3)

---

## 1. System Overview

SourceClip is structured with strict separation of concerns between the **Electron Main Process** (OS integration, SQLite database, background clipboard watcher, and the Bridge HTTP server) and the **Renderer Process** (React UI, state management, and user interaction).

```
+-------------------------------------------------------------------------+
|                         WINDOWS OPERATING SYSTEM                        |
+-------------------------------------------------------------------------+
       |                                                    |
       v                                                    v
[System Clipboard]                                [Local Wi-Fi Network]
       |                                                    |
       v                                                    v
+-------------------------------------------------------------------------+
|                          MAIN PROCESS (Node.js)                         |
|                                                                         |
|  +---------------------+   +-------------------+   +-----------------+  |
|  | Clipboard Monitor   |   | SQLite Database   |   | Bridge Server   |  |
|  | (500ms poller)      |   | (WAL Mode, C++)   |   | (HTTP / LAN)    |  |
|  +---------------------+   +-------------------+   +-----------------+  |
|             \                       |                       /           |
|              +----------------------+----------------------+            |
|                                     |                                   |
|                        IPC Dispatcher (ipcMain)                         |
+-------------------------------------------------------------------------+
                                      |
                           contextBridge (preload.mjs)
                                      |
+-------------------------------------------------------------------------+
|                        RENDERER PROCESS (Chromium)                      |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | React 18 Application (Vite Bundled, Pure Client)                   |  |
|  |                                                                   |  |
|  |  [Header & Language]    [Search / Filter]     [Clipboard Grid]    |  |
|  |                                                                   |  |
|  |  [Bridge Modal]         [Pairing Dialog]      [QR Generator]      |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Core Modules

### 2.1 Database Layer (`electron/database.ts`)
- **Engine**: SQLite 3 via `better-sqlite3` (native C++ synchronous driver for high throughput and zero async locking bugs).
- **Journal Mode**: `WAL` (Write-Ahead Logging) for concurrent reads while writes occur.
- **Storage Location**: Automatically created in `%APPDATA%\sourceclip\clipboard.db` (`app.getPath('userData')`). In development mode, falls back to the project root.
- **Auto-Cleanup**: Unpinned items older than 7 days are automatically pruned on launch to keep the database lightweight.
- **Schema**:
  ```sql
  CREATE TABLE IF NOT EXISTS clipboard_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    source_app TEXT
  );
  ```

### 2.2 Bridge Engine (`electron/bridge.ts`)
The SourceClip Bridge allows an Android device on the same local Wi-Fi router to send snippets to the PC without installing any mobile application.
- **Transport**: Standard Node.js `http.Server` listening on private network interfaces (`0.0.0.0`, port 32123 or next available dynamic port).
- **Interface Enumeration**: Inspects `os.networkInterfaces()` to detect non-internal IPv4 private addresses (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`) and sorts them to prioritize Wi-Fi/WLAN adapters over virtual or Ethernet adapters.
- **Endpoints**:
  - `GET /`: Serves the responsive, mobile-optimized Web Client.
  - `POST /api/pair`: Initiates pairing from mobile with pairing token and client User-Agent.
  - `GET /api/status`: Heartbeat & state polling (pending, connected, disconnected).
  - `POST /api/send`: Authenticated content transmission (requires Bearer token, max 64KB, rate limited).
  - `POST /api/unpair`: Terminate pairing session.

### 2.3 Mobile Web Client (Embedded Single-Page Application)
- Served directly from `electron/bridge.ts` as an in-memory HTML document.
- Zero external CDN dependencies (works entirely offline on isolated local Wi-Fi without internet connectivity).
- Features clean mobile-first CSS, Web Clipboard API integration (`navigator.clipboard.readText()`), live status polling, and error toasts.

### 2.4 Preload Bridge (`electron/preload.ts`)
- Configured with `contextIsolation: true` and `nodeIntegration: false`.
- Selectively exposes secure, typed IPC methods through `window.api`.

### 2.5 Zero-Dependency QR Code Generator (`src/utils/qrcode.ts`)
- High-performance, pure TypeScript QR Code matrix and SVG generator.
- Encodes URLs with Medium (`M`) error correction level.
- Generates crisp vector SVG elements directly inside the React DOM with zero third-party npm packages.

---

## 3. Data Flow

### Clipboard Capture Flow
1. User copies text anywhere in Windows (`Ctrl+C`).
2. Main process poller detects clipboard string change.
3. Content is stored in SQLite (`source_app: 'desktop'`).
4. IPC event `clipboard-updated` is dispatched to the renderer.
5. React UI updates dynamically with smooth transitions.

### Bridge Transfer Flow
1. Mobile user scans QR code (`http://<PC-IP>:32123/?token=<secret>`).
2. Mobile browser loads client and issues `POST /api/pair`.
3. Desktop main process displays incoming pairing prompt with 6-digit PIN.
4. User clicks "Approve" on Desktop.
5. Mobile client heartbeat transitions to `connected` and receives a session Bearer token.
6. Mobile user submits text/link via `POST /api/send`.
7. Main process validates length, UTF-8 integrity, and writes to SQLite (`source_app: 'bridge'`).
8. Desktop UI displays incoming snippet with `📱 Phone` badge and triggers a toast notification.

