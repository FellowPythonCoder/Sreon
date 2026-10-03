const START_URL = 'sreon://start';
const SEARCH_BASE = 'https://duckduckgo.com/?q=';

const state = {
  tabs: [],
  activeId: null,
  lastFocusedOmniboxValue: '',
  progressTimer: null,
};

const els = {
  body: document.body,
  tabs: document.getElementById('tabs'),
  tabTemplate: document.getElementById('tabTemplate'),
  webviews: document.getElementById('webviews'),
  startPage: document.getElementById('startPage'),
  omniboxForm: document.getElementById('omniboxForm'),
  omnibox: document.getElementById('omnibox'),
  omniboxWrap: document.getElementById('omniboxWrap'),
  clearOmnibox: document.getElementById('clearOmnibox'),
  startSearchForm: document.getElementById('startSearchForm'),
  startSearch: document.getElementById('startSearch'),
  backButton: document.getElementById('backButton'),
  forwardButton: document.getElementById('forwardButton'),
  reloadButton: document.getElementById('reloadButton'),
  newTabButton: document.getElementById('newTabButton'),
  shareButton: document.getElementById('shareButton'),
  menuButton: document.getElementById('menuButton'),
  menuPopover: document.getElementById('menuPopover'),
  progressBar: document.getElementById('progressBar'),
  siteBadge: document.getElementById('siteBadge'),
  statusBubble: document.getElementById('statusBubble'),
  toastStack: document.getElementById('toastStack'),
};

const isMac = window.sreon?.platform === 'darwin';
els.body.classList.add(`platform-${window.sreon?.platform || 'unknown'}`);

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function activeTab() {
  return state.tabs.find((tab) => tab.id === state.activeId) || null;
}

function looksLikeURL(input) {
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(input)) return true;
  if (/^localhost(?::\d+)?(?:\/.*)?$/i.test(input)) return true;
  if (/^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/.*)?$/.test(input)) return true;
  if (/^\[[0-9a-f:]+\](?::\d+)?(?:\/.*)?$/i.test(input)) return true;
  return /^[^\s]+\.[^\s]{2,}(?:\/.*)?$/i.test(input);
}

function normalizeAddress(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (raw === START_URL) return START_URL;

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw)) {
    const scheme = raw.split(':')[0].toLowerCase();
    if (['http', 'https', 'about', 'data', 'blob'].includes(scheme)) return raw;
    toast('Opened externally', `${scheme}: links are handled by macOS, not inside Sreon.`);
    window.sreon.openExternal(raw).catch(() => {});
    return '';
  }

  if (looksLikeURL(raw)) {
    if (/^localhost|^(?:\d{1,3}\.){3}\d{1,3}|^\[[0-9a-f:]+\]/i.test(raw)) {
      return `http://${raw}`;
    }
    return `https://${raw}`;
  }

  return `${SEARCH_BASE}${encodeURIComponent(raw)}`;
}

function displayURL(rawURL) {
  if (!rawURL || rawURL === START_URL) return '';
  try {
    const url = new URL(rawURL);
    if (url.href.startsWith(SEARCH_BASE)) {
      return decodeURIComponent(url.searchParams.get('q') || '').trim() || rawURL;
    }
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      const path = `${url.pathname}${url.search}${url.hash}`;
      return `${url.host}${path === '/' ? '' : path}`;
    }
    return rawURL;
  } catch {
    return rawURL;
  }
}

function isSecureURL(rawURL) {
  try { return new URL(rawURL).protocol === 'https:'; } catch { return false; }
}

function isSearchURL(rawURL) {
  return !rawURL || rawURL === START_URL || rawURL.startsWith(SEARCH_BASE);
}

function createTab(initialURL = '', options = {}) {
  const tab = {
    id: uid(),
    title: 'New Tab',
    url: START_URL,
    favicon: '',
    loading: false,
    canGoBack: false,
    canGoForward: false,
    isStart: true,
    view: null,
  };

  state.tabs.push(tab);
  renderTabs();

  if (options.activate !== false) activateTab(tab.id, { focusLocation: !initialURL });
  if (initialURL) navigateTab(tab, initialURL);

  return tab;
}

function closeTab(id = state.activeId) {
  const index = state.tabs.findIndex((tab) => tab.id === id);
  if (index === -1) return;

  const [tab] = state.tabs.splice(index, 1);
  if (tab.view) tab.view.remove();

  if (state.activeId === id) {
    const next = state.tabs[index] || state.tabs[index - 1] || null;
    state.activeId = next ? next.id : null;
  }

  if (state.tabs.length === 0) {
    createTab('', { activate: true });
  } else {
    activateTab(state.activeId);
  }
}

function ensureWebview(tab, url) {
  if (tab.view) return { view: tab.view, isNew: false };

  const view = document.createElement('webview');
  view.className = 'browser-view';
  view.setAttribute('partition', 'persist:sreon');
  view.setAttribute('allowpopups', '');
  view.setAttribute('webpreferences', 'contextIsolation=yes,nodeIntegration=no,sandbox=yes,nativeWindowOpen=no');
  view.src = url || 'about:blank';
  els.webviews.appendChild(view);
  tab.view = view;
  attachWebviewEvents(tab, view);
  return { view, isNew: true };
}

function attachWebviewEvents(tab, view) {
  const refreshCapabilities = () => {
    try {
      tab.canGoBack = view.canGoBack();
      tab.canGoForward = view.canGoForward();
    } catch {
      tab.canGoBack = false;
      tab.canGoForward = false;
    }
  };

  view.addEventListener('did-start-loading', () => {
    tab.loading = true;
    refreshCapabilities();
    startProgress();
    updateUI();
  });

  view.addEventListener('did-stop-loading', () => {
    tab.loading = false;
    try { tab.url = view.getURL() || tab.url; } catch {}
    refreshCapabilities();
    finishProgress();
    updateUI();
  });

  view.addEventListener('did-navigate', (event) => {
    tab.url = event.url;
    tab.isStart = false;
    refreshCapabilities();
    updateUI();
  });

  view.addEventListener('did-navigate-in-page', (event) => {
    tab.url = event.url;
    refreshCapabilities();
    updateUI();
  });

  view.addEventListener('page-title-updated', (event) => {
    tab.title = event.title || displayURL(tab.url) || 'Untitled';
    updateUI();
  });

  view.addEventListener('page-favicon-updated', (event) => {
    tab.favicon = event.favicons?.find(Boolean) || '';
    renderTabs();
  });

  view.addEventListener('did-fail-load', (event) => {
    if (event.errorCode === -3) return; // navigation aborted by a new load
    tab.loading = false;
    tab.title = 'Can’t Open Page';
    finishProgress();
    toast('Can’t open page', `${event.validatedURL || tab.url} (${event.errorDescription})`);
    updateUI();
  });

  view.addEventListener('update-target-url', (event) => {
    setStatus(event.url || '');
  });
}

function navigateTab(tab, input) {
  const url = normalizeAddress(input);
  if (!url) return;

  if (url === START_URL) {
    tab.isStart = true;
    tab.url = START_URL;
    tab.title = 'New Tab';
    tab.loading = false;
    activateTab(tab.id, { focusLocation: true });
    return;
  }

  tab.isStart = false;
  tab.url = url;
  tab.loading = true;
  tab.title = displayURL(url) || 'Loading…';

  const { view, isNew } = ensureWebview(tab, url);
  if (!isNew) view.loadURL(url);

  activateTab(tab.id);
  startProgress();
  updateUI({ forceOmnibox: true });
}

function navigateActive(input) {
  const tab = activeTab();
  if (!tab) return;
  navigateTab(tab, input);
}

function activateTab(id, options = {}) {
  if (!id) return;
  state.activeId = id;

  const tab = activeTab();
  for (const item of state.tabs) {
    if (item.view) item.view.classList.toggle('active', item.id === id && !item.isStart);
  }
  els.startPage.classList.toggle('active', Boolean(tab?.isStart));

  renderTabs();
  updateUI({ forceOmnibox: options.forceOmnibox });

  if (options.focusLocation) {
    requestAnimationFrame(() => focusLocation());
  }
}

function renderTabs() {
  els.tabs.textContent = '';

  for (const tab of state.tabs) {
    const node = els.tabTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.tabId = tab.id;
    node.classList.toggle('active', tab.id === state.activeId);
    node.classList.toggle('loading', tab.loading);
    node.title = tab.url === START_URL ? 'New Tab' : tab.url;
    node.querySelector('.tab-title').textContent = tab.title || 'New Tab';

    const favicon = node.querySelector('.tab-favicon');
    if (tab.favicon) {
      const img = document.createElement('img');
      img.src = tab.favicon;
      img.alt = '';
      favicon.textContent = '';
      favicon.appendChild(img);
    }

    node.addEventListener('click', () => activateTab(tab.id));
    node.addEventListener('auxclick', (event) => {
      if (event.button === 1) closeTab(tab.id);
    });

    const close = node.querySelector('.tab-close');
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });

    els.tabs.appendChild(node);
  }

  requestAnimationFrame(() => {
    const activeNode = els.tabs.querySelector('.tab.active');
    activeNode?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  });
}

function updateUI(options = {}) {
  const tab = activeTab();
  if (!tab) return;

  const canEditOmnibox = document.activeElement !== els.omnibox || options.forceOmnibox;
  if (canEditOmnibox) {
    els.omnibox.value = tab.isStart ? '' : displayURL(tab.url);
  }

  els.backButton.disabled = !tab.canGoBack;
  els.forwardButton.disabled = !tab.canGoForward;
  els.reloadButton.disabled = tab.isStart;
  els.shareButton.disabled = tab.isStart;

  els.siteBadge.classList.toggle('search', isSearchURL(tab.url));
  els.siteBadge.classList.toggle('insecure', Boolean(tab.url && tab.url !== START_URL && !isSecureURL(tab.url)));

  document.title = tab.title && tab.title !== 'New Tab' ? `${tab.title} — Sreon` : 'Sreon';
  renderTabs();
}

function startProgress() {
  clearTimeout(state.progressTimer);
  els.progressBar.style.opacity = '1';
  els.progressBar.style.width = '18%';
  requestAnimationFrame(() => {
    els.progressBar.style.width = '72%';
  });
}

function finishProgress() {
  clearTimeout(state.progressTimer);
  els.progressBar.style.width = '100%';
  state.progressTimer = setTimeout(() => {
    els.progressBar.style.opacity = '0';
    els.progressBar.style.width = '0%';
  }, 320);
}

function focusLocation() {
  const tab = activeTab();
  if (tab && !tab.isStart) els.omnibox.value = tab.url;
  els.omnibox.focus();
  els.omnibox.select();
}

function reloadActive({ hard = false } = {}) {
  const tab = activeTab();
  if (!tab?.view || tab.isStart) return;
  if (tab.loading) {
    tab.view.stop();
  } else if (hard) {
    tab.view.reloadIgnoringCache();
  } else {
    tab.view.reload();
  }
}

function goBack() {
  const tab = activeTab();
  if (tab?.view && tab.canGoBack) tab.view.goBack();
}

function goForward() {
  const tab = activeTab();
  if (tab?.view && tab.canGoForward) tab.view.goForward();
}

function setStatus(text) {
  if (!text) {
    els.statusBubble.hidden = true;
    els.statusBubble.textContent = '';
    return;
  }
  els.statusBubble.textContent = text;
  els.statusBubble.hidden = false;
}

function toggleMenu(force) {
  const next = typeof force === 'boolean' ? force : els.menuPopover.hidden;
  els.menuPopover.hidden = !next;
}

function runCommand(command) {
  switch (command) {
    case 'new-tab':
      createTab('', { activate: true });
      break;
    case 'close-tab':
      closeTab();
      break;
    case 'focus-location':
      focusLocation();
      break;
    case 'reload':
      reloadActive();
      break;
    case 'hard-reload':
      reloadActive({ hard: true });
      break;
    case 'back':
      goBack();
      break;
    case 'forward':
      goForward();
      break;
    case 'copy-url':
      copyCurrentURL();
      break;
    case 'open-external':
      openCurrentExternally();
      break;
    case 'clear-data':
      clearData();
      break;
    case 'about':
      aboutSreon();
      break;
    default:
      break;
  }
}

async function copyCurrentURL() {
  const tab = activeTab();
  if (!tab || tab.isStart) return;
  try {
    await navigator.clipboard.writeText(tab.url);
    toast('Copied URL', displayURL(tab.url));
  } catch {
    toast('Copy failed', 'macOS did not allow clipboard access from this page.');
  }
}

async function openCurrentExternally() {
  const tab = activeTab();
  if (!tab || tab.isStart) return;
  await window.sreon.openExternal(tab.url);
  toast('Opened in default browser', displayURL(tab.url));
}

async function clearData() {
  toggleMenu(false);
  await window.sreon.clearBrowsingData();
  for (const tab of state.tabs) {
    tab.favicon = '';
    tab.canGoBack = false;
    tab.canGoForward = false;
  }
  toast('Browsing data cleared', 'Cookies, cache, local storage, and service workers were removed.');
  updateUI({ forceOmnibox: true });
}

async function aboutSreon() {
  const info = await window.sreon.appInfo();
  toast('Sreon Browser', `Version ${info.version}. Chromium ${info.chrome}. No AI features included.`);
}

function toast(title, message = '') {
  const node = document.createElement('div');
  node.className = 'toast';
  node.innerHTML = `<strong></strong><p></p>`;
  node.querySelector('strong').textContent = title;
  node.querySelector('p').textContent = message;
  els.toastStack.appendChild(node);
  setTimeout(() => {
    node.style.opacity = '0';
    node.style.transform = 'translateY(8px) scale(0.98)';
    node.style.transition = 'opacity 180ms ease, transform 180ms ease';
    setTimeout(() => node.remove(), 200);
  }, 3800);
}

function humanBytes(bytes) {
  if (!bytes || bytes < 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function bindEvents() {
  els.newTabButton.addEventListener('click', () => createTab('', { activate: true }));
  els.backButton.addEventListener('click', goBack);
  els.forwardButton.addEventListener('click', goForward);
  els.reloadButton.addEventListener('click', () => reloadActive());
  els.shareButton.addEventListener('click', openCurrentExternally);
  els.menuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  els.omniboxForm.addEventListener('submit', (event) => {
    event.preventDefault();
    navigateActive(els.omnibox.value);
    els.omnibox.blur();
  });

  els.omnibox.addEventListener('focus', () => {
    state.lastFocusedOmniboxValue = els.omnibox.value;
    const tab = activeTab();
    if (tab && !tab.isStart) els.omnibox.value = tab.url;
    els.omnibox.select();
  });

  els.omnibox.addEventListener('blur', () => updateUI({ forceOmnibox: true }));

  els.clearOmnibox.addEventListener('click', () => {
    els.omnibox.value = '';
    els.omnibox.focus();
  });

  els.startSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = els.startSearch.value.trim();
    if (value) navigateActive(value);
  });

  document.querySelectorAll('.quick-actions [data-url]').forEach((button) => {
    button.addEventListener('click', () => navigateActive(button.dataset.url));
  });

  document.querySelectorAll('[data-window-action]').forEach((button) => {
    button.addEventListener('click', () => window.sreon.windowControl(button.dataset.windowAction));
  });

  els.menuPopover.addEventListener('click', (event) => {
    const button = event.target.closest('[data-command]');
    if (!button) return;
    toggleMenu(false);
    runCommand(button.dataset.command);
  });

  document.addEventListener('click', (event) => {
    if (!els.menuPopover.hidden && !els.menuPopover.contains(event.target) && event.target !== els.menuButton) {
      toggleMenu(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const meta = isMac ? event.metaKey : event.ctrlKey;

    if (event.key === 'Escape') {
      toggleMenu(false);
      if (document.activeElement === els.omnibox) {
        els.omnibox.blur();
        updateUI({ forceOmnibox: true });
      }
      return;
    }

    if (!meta) return;

    const commandMap = {
      t: 'new-tab',
      w: 'close-tab',
      l: 'focus-location',
      r: event.shiftKey ? 'hard-reload' : 'reload',
      '[': 'back',
      ']': 'forward',
    };

    if (commandMap[key]) {
      event.preventDefault();
      runCommand(commandMap[key]);
      return;
    }

    if (/^[1-9]$/.test(key)) {
      event.preventDefault();
      const index = key === '9' ? state.tabs.length - 1 : Number(key) - 1;
      const tab = state.tabs[index];
      if (tab) activateTab(tab.id);
    }
  });

  window.sreon.onMenuCommand((command) => runCommand(command));
  window.sreon.onOpenURLInNewTab((url) => createTab(url, { activate: true }));
  window.sreon.onDownloadState((download) => {
    if (download.state === 'started') {
      toast('Download started', download.filename);
    } else if (download.state === 'completed') {
      toast('Download complete', `${download.filename} ${humanBytes(download.totalBytes)}`.trim());
    } else if (download.state === 'interrupted') {
      toast('Download interrupted', download.filename);
    }
  });
}

bindEvents();
createTab('', { activate: true });

window.addEventListener('contextmenu', (event) => {
  // Keep the shell minimal and native-like; remote page context menus remain inside webviews.
  if (!event.target.closest('webview')) event.preventDefault();
});
