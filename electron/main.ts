import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { initDb, getHistory, addEntry, searchHistory, deleteEntry, clearUnpinnedHistory, togglePin, cleanupOldHistory } from './database';
import { bridgeServer } from './bridge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let lastText = '';
let mainWindow: BrowserWindow | null = null;

// Prevent multiple instances running at the same time
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    const iconPath = app.isPackaged
      ? path.join(app.getAppPath(), 'public/logo.png')
      : path.join(__dirname, '../public/logo.png');

    mainWindow = new BrowserWindow({
      width: 460,
      height: 640,
      minWidth: 340,
      minHeight: 450,
      autoHideMenuBar: true,
      icon: iconPath,
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load the web app
    if (app.isPackaged) {
      mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
    } else if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Handle load failure gracefully
    mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
      console.error('Failed to load page:', errorCode, errorDescription, validatedURL);
    });

    const clipboardInterval = setInterval(async () => {
      const currentText = await clipboard.readText();
      if (currentText !== lastText) {
        lastText = currentText;
        if (currentText) {
          addEntry(currentText, 'desktop');
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('clipboard-updated');
          }
        }
      }
    }, 500); 

    mainWindow.on('closed', () => {
      clearInterval(clipboardInterval);
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    initDb();
    cleanupOldHistory(7); 

    // Setup Bridge Server Event Handlers
    bridgeServer.onContentReceived((text, ip) => {
      addEntry(text, 'bridge');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('clipboard-updated');
        mainWindow.webContents.send('bridge-content-received', { text, ip });
      }
    });

    bridgeServer.onStatusChange((status) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('bridge-status-changed', status);
      }
    });

    bridgeServer.onPairingRequest((req) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('bridge-pairing-request', req);
      }
    });
    
    // Core Clipboard IPC
    ipcMain.handle('get-history', () => getHistory());
    ipcMain.handle('search-history', (_, keyword) => searchHistory(keyword));
    
    ipcMain.on('copy-to-clipboard', (_, text) => {
      lastText = text;
      clipboard.writeText(text);
    });

    ipcMain.on('delete-entry', (_, id) => deleteEntry(id));
    ipcMain.on('clear-history', () => clearUnpinnedHistory());
    ipcMain.on('toggle-pin', (_, id, isPinned) => togglePin(id, isPinned));

    // SourceClip Bridge IPC Handlers
    ipcMain.handle('bridge-get-status', () => bridgeServer.getStatus());
    ipcMain.handle('bridge-start', (_, port) => bridgeServer.start(port));
    ipcMain.handle('bridge-stop', () => bridgeServer.stop());
    ipcMain.handle('bridge-set-ip', (_, ip) => bridgeServer.setSelectedIp(ip));
    ipcMain.handle('bridge-approve-pairing', (_, reqId) => bridgeServer.approvePairing(reqId));
    ipcMain.handle('bridge-reject-pairing', (_, reqId) => bridgeServer.rejectPairing(reqId));
    ipcMain.handle('bridge-unpair', () => bridgeServer.unpairDevice());
    ipcMain.handle('bridge-regenerate-pin', () => {
      bridgeServer.generateNewPairingCredentials();
      return bridgeServer.getStatus();
    });

    createWindow();
  });

  app.on('before-quit', async () => {
    await bridgeServer.stop();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
