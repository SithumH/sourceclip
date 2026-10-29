import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getHistory: () => ipcRenderer.invoke('get-history'),
  searchHistory: (keyword: string) => ipcRenderer.invoke('search-history', keyword),
  copyToClipboard: (text: string) => ipcRenderer.send('copy-to-clipboard', text),
  
  deleteEntry: (id: number) => ipcRenderer.send('delete-entry', id),
  clearHistory: () => ipcRenderer.send('clear-history'),
  togglePin: (id: number, isPinned: number) => ipcRenderer.send('toggle-pin', id, isPinned),

  onClipboardUpdate: (callback: () => void) => {
    ipcRenderer.on('clipboard-updated', () => callback());
  },

  // SourceClip Bridge (Phone-to-PC Sharing) API
  getBridgeStatus: () => ipcRenderer.invoke('bridge-get-status'),
  startBridge: (port?: number) => ipcRenderer.invoke('bridge-start', port),
  stopBridge: () => ipcRenderer.invoke('bridge-stop'),
  setBridgeIp: (ip: string) => ipcRenderer.invoke('bridge-set-ip', ip),
  approveBridgePairing: (requestId: string) => ipcRenderer.invoke('bridge-approve-pairing', requestId),
  rejectBridgePairing: (requestId: string) => ipcRenderer.invoke('bridge-reject-pairing', requestId),
  unpairBridgeDevice: () => ipcRenderer.invoke('bridge-unpair'),
  regenerateBridgePin: () => ipcRenderer.invoke('bridge-regenerate-pin'),

  onBridgeStatusChange: (callback: (status: any) => void) => {
    ipcRenderer.on('bridge-status-changed', (_, status) => callback(status));
  },
  onBridgePairingRequest: (callback: (req: any) => void) => {
    ipcRenderer.on('bridge-pairing-request', (_, req) => callback(req));
  },
  onBridgeContentReceived: (callback: (data: { text: string; ip: string }) => void) => {
    ipcRenderer.on('bridge-content-received', (_, data) => callback(data));
  }
});
