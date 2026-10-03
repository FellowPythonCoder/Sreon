const { app, BrowserWindow, Menu, ipcMain, session, shell, dialog, nativeTheme } = require('electron');
const path = require('node:path');

const isMac = process.platform === 'darwin';
let mainWindow;

app.name = 'Sreon';
nativeTheme.themeSource = 'system';

// Keep the browser feeling native and smooth on high-refresh displays.
app.commandLine.appendSwitch('enable-features', 'OverlayScrollbar');
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

function safeURL(raw) {
  try {
    const url = new URL(raw);
    return ['http:', 'https:', 'about:', 'data:', 'blob:'].includes(url.protocol);
  } catch {
    return raw === 'about:blank';
  }
}

function ownerWindowFromWebContents(contents) {
  const host = contents?.hostWebContents;
  if (host && !host.isDestroyed()) return BrowserWindow.fromWebContents(host);
  if (contents && !contents.isDestroyed()) return BrowserWindow.fromWebContents(contents);
  return mainWindow;
}

function sendToMain(command, payload = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(command, payload);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 920,
    minHeight: 640,
    title: 'Sreon',
    backgroundColor: '#f5f5f7',
    show: false,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    trafficLightPosition: isMac ? { x: 18, y: 18 } : undefined,
    vibrancy: isMac ? 'under-window' : undefined,
    visualEffectState: isMac ? 'active' : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
      spellcheck: true,
      devTools: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.send('menu-command', 'focus-location');
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (safeURL(url)) {
      mainWindow.webContents.send('open-url-in-new-tab', url);
    } else {
      shell.openExternal(url).catch(() => {});
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-attach-webview', (event, webPreferences) => {
    // Remote pages must never inherit app privileges.
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
    webPreferences.allowRunningInsecureContent = false;
    webPreferences.plugins = false;
  });
}

function setupSessions() {
  const defaultSession = session.defaultSession;

  defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    if (permission === 'fullscreen' || permission === 'pointerLock' || permission === 'clipboard-sanitized-write') {
      callback(true);
      return;
    }

    const owner = ownerWindowFromWebContents(webContents) || mainWindow;
    const requestingURL = details?.requestingUrl || webContents.getURL();
    const host = (() => {
      try { return new URL(requestingURL).host; } catch { return requestingURL || 'this site'; }
    })();

    const permissionLabels = {
      media: 'camera and microphone',
      geolocation: 'location',
      notifications: 'notifications',
      midi: 'MIDI devices',
      midiSysex: 'MIDI system exclusive devices',
      clipboardRead: 'clipboard',
      'clipboard-read': 'clipboard',
      openExternal: 'external apps',
    };

    dialog.showMessageBox(owner, {
      type: 'question',
      buttons: ['Deny', 'Allow'],
      defaultId: 0,
      cancelId: 0,
      title: 'Site Permission',
      message: `Allow ${host} to use ${permissionLabels[permission] || permission}?`,
      detail: 'Sreon is no-AI and privacy-first. Permissions are only granted after you approve them.',
    }).then(({ response }) => callback(response === 1)).catch(() => callback(false));
  });

  defaultSession.on('will-download', (event, item, webContents) => {
    const filename = item.getFilename();
    const savePath = path.join(app.getPath('downloads'), filename);
    item.setSavePath(savePath);

    const owner = ownerWindowFromWebContents(webContents) || mainWindow;
    const send = (payload) => {
      if (owner && !owner.isDestroyed()) owner.webContents.send('download-state', payload);
    };

    send({ state: 'started', filename, savePath, receivedBytes: 0, totalBytes: item.getTotalBytes() });

    item.on('updated', (_, state) => {
      send({
        state,
        filename,
        savePath,
        receivedBytes: item.getReceivedBytes(),
        totalBytes: item.getTotalBytes(),
      });
    });

    item.once('done', (_, state) => {
      send({ state, filename, savePath, receivedBytes: item.getReceivedBytes(), totalBytes: item.getTotalBytes() });
    });
  });
}

function createMenu() {
  const send = (command) => () => sendToMain('menu-command', command);

  const template = [
    ...(isMac ? [{
      label: 'Sreon',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'Clear Browsing Data…', click: send('clear-data') },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New Tab', accelerator: 'CmdOrCtrl+T', click: send('new-tab') },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: send('close-tab') },
        { type: 'separator' },
        { label: 'Open Location', accelerator: 'CmdOrCtrl+L', click: send('focus-location') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: send('reload') },
        { label: 'Hard Reload', accelerator: 'CmdOrCtrl+Shift+R', click: send('hard-reload') },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        { label: 'Back', accelerator: 'CmdOrCtrl+[', click: send('back') },
        { label: 'Forward', accelerator: 'CmdOrCtrl+]', click: send('forward') },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        ...(isMac ? [{ role: 'zoom' }, { type: 'separator' }, { role: 'front' }] : [{ role: 'close' }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        { label: 'About Sreon', click: send('about') },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  setupSessions();
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() !== 'webview') return;

  contents.setWindowOpenHandler(({ url }) => {
    const owner = contents.hostWebContents;
    if (owner && !owner.isDestroyed()) {
      owner.send('open-url-in-new-tab', url);
    } else if (safeURL(url)) {
      sendToMain('open-url-in-new-tab', url);
    } else {
      shell.openExternal(url).catch(() => {});
    }
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    if (!safeURL(url)) {
      event.preventDefault();
      shell.openExternal(url).catch(() => {});
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

ipcMain.handle('app-info', () => ({
  name: app.name,
  version: app.getVersion(),
  platform: process.platform,
  electron: process.versions.electron,
  chrome: process.versions.chrome,
}));

ipcMain.handle('clear-browsing-data', async () => {
  await Promise.all([
    session.defaultSession.clearCache(),
    session.defaultSession.clearStorageData({
      storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage'],
    }),
  ]);
  return { ok: true };
});

ipcMain.handle('open-external', async (_event, rawURL) => {
  if (!rawURL || typeof rawURL !== 'string') return { ok: false };
  await shell.openExternal(rawURL);
  return { ok: true };
});

ipcMain.on('window-control', (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (action === 'minimize') win.minimize();
  if (action === 'maximize') win.isMaximized() ? win.unmaximize() : win.maximize();
  if (action === 'close') win.close();
});
