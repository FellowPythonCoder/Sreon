const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
  const listener = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('sreon', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },
  appInfo: () => ipcRenderer.invoke('app-info'),
  clearBrowsingData: () => ipcRenderer.invoke('clear-browsing-data'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  windowControl: (action) => ipcRenderer.send('window-control', action),
  onMenuCommand: (callback) => subscribe('menu-command', callback),
  onOpenURLInNewTab: (callback) => subscribe('open-url-in-new-tab', callback),
  onDownloadState: (callback) => subscribe('download-state', callback),
});
