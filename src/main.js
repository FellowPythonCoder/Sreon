import './styles.css';

const iconPaths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
  tabs: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/>',
  bookmark: '<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.4L6 21z"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 7v5l3 2"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  shield: '<path d="M12 3 20 6v6c0 5.1-3.4 8.6-8 10-4.6-1.4-8-4.9-8-10V6z"/><path d="m8.7 12 2.2 2.2 4.4-4.6"/>',
  settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-1.3l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-1.3-3h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 1.3-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-1.3v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 1.3l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 1.3 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-1.3 3z"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h10M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
  folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2h8A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  arrowLeft: '<path d="m15 18-6-6 6-6"/>',
  arrowRight: '<path d="m9 18 6-6-6-6"/>',
  rotate: '<path d="M20 11a8.1 8.1 0 0 0-15-3L3 10"/><path d="M3 5v5h5M4 13a8.1 8.1 0 0 0 15 3l2-2"/><path d="M21 19v-5h-5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
  more: '<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  command: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h8v8H8zM8 12h8M12 8v8"/>',
  external: '<path d="M14 5h5v5M19 5l-8 8"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  eye: '<path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
  eyeOff: '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.7 9.7 0 0 1 12 5c6.2 0 9.5 7 9.5 7a16.5 16.5 0 0 1-3.2 4.1M6.2 6.2C3.7 8.1 2.5 12 2.5 12S5.8 19 12 19c1 0 1.9-.2 2.7-.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20.5 15.4A8.5 8.5 0 0 1 8.6 3.5 8.5 8.5 0 1 0 20.5 15.4z"/>',
  drag: '<circle cx="9" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="17" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="1" fill="currentColor" stroke="none"/>',
  volume: '<path d="M4 10v4h4l5 4V6l-5 4zM16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11"/>',
  volumeOff: '<path d="m4 10 5 4h4V6l-5 4H4zM17 9l4 6M21 9l-4 6"/>',
  pin: '<path d="m15 4 5 5-3 1-3.5 3.5V18l-3 3v-6.5L7 11l3.5-3.5 1-3z"/>',
  monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  wifi: '<path d="M2 8.5a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0M12 19h.01"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  arrowUp: '<path d="m6 15 6-6 6 6"/>',
  refresh: '<path d="M20 11a8.1 8.1 0 0 0-15-3L3 10"/><path d="M3 5v5h5M4 13a8.1 8.1 0 0 0 15 3l2-2"/><path d="M21 19v-5h-5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  spark: '<path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5z"/>',
  shieldCheck: '<path d="M12 3 20 6v6c0 5.1-3.4 8.6-8 10-4.6-1.4-8-4.9-8-10V6z"/><path d="m8.5 12.2 2.3 2.2 4.8-5"/>',
  keyboard: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 14h8M16 14h2"/>'
};

const icon = (name, size = 18, className = '') => `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.globe}</svg>`;
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const navItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'tabs', label: 'Tabs', icon: 'tabs', count: true },
  { id: 'bookmarks', label: 'Bookmarks', icon: 'bookmark' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'downloads', label: 'Downloads', icon: 'download' },
  { id: 'workspaces', label: 'Workspaces', icon: 'layers' }
];

const defaultTabs = [
  { id: 'home-tab', title: 'New tab', url: 'sreon://home', domain: 'Sreon', icon: 'sreon', pinned: true },
  { id: 'design-tab', title: 'Sreon — a little more room', url: 'https://opensreon.com', domain: 'opensreon.com', icon: 'sreon' },
  { id: 'github-tab', title: 'GitHub · Build software', url: 'https://github.com', domain: 'github.com', icon: 'github' },
  { id: 'read-tab', title: 'The quiet web', url: 'https://example.com', domain: 'example.com', icon: 'globe' }
];

const state = {
  route: 'home',
  query: '',
  searchResults: null,
  isSearching: false,
  sidebarMode: 'expanded',
  sidebarWidth: 268,
  accent: '#ad92f7',
  theme: 'dark',
  privacyShield: true,
  commandOpen: false,
  customizeOpen: false,
  activeTabId: 'home-tab',
  tabs: defaultTabs,
  bookmarks: [
    { title: 'Sreon', url: 'https://opensreon.com', domain: 'opensreon.com', icon: 'sreon' },
    { title: 'GitHub', url: 'https://github.com', domain: 'github.com', icon: 'github' },
    { title: 'Awwwards', url: 'https://awwwards.com', domain: 'awwwards.com', icon: 'globe' }
  ],
  history: [
    { title: 'Sreon — a little more room to explore', url: 'https://opensreon.com', time: 'Today, 10:42', icon: 'sreon' },
    { title: 'GitHub · Build software better', url: 'https://github.com', time: 'Yesterday, 18:20', icon: 'github' },
    { title: 'The quiet web', url: 'https://example.com', time: 'Yesterday, 14:08', icon: 'globe' }
  ],
  downloads: [
    { title: 'sreon-brand-assets.zip', size: '2.4 MB', time: 'Today, 09:18', type: 'ZIP' },
    { title: 'Sreon-1.0.0.dmg', size: '86.7 MB', time: 'Jun 14, 16:32', type: 'DMG' }
  ],
  settings: { reducedMotion: false, blockTrackers: true, clearOnQuit: false, sendUsage: false, showFavicons: true }
};

function activeTab() { return state.tabs.find(tab => tab.id === state.activeTabId) || state.tabs[0]; }
function tabIcon(tab, size = 16) {
  if (tab.icon === 'sreon') return `<img class="site-favicon" src="/brand/favicon.svg" alt="" width="${size}" height="${size}">`;
  if (tab.icon === 'github') return `<span class="favicon-letter github-mark" style="width:${size}px;height:${size}px">‹›</span>`;
  return `<span class="favicon-letter" style="width:${size}px;height:${size}px">${tab.icon === 'globe' ? icon('globe', size - 2) : escapeHtml((tab.domain || 'S')[0].toUpperCase())}</span>`;
}

function render() {
  const root = document.querySelector('#app');
  const tab = activeTab();
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.reducedMotion = state.settings.reducedMotion ? 'true' : 'false';
  document.documentElement.style.setProperty('--accent', state.accent);
  document.documentElement.style.setProperty('--sidebar-width', `${state.sidebarWidth}px`);
  root.innerHTML = `
    <div class="app-shell mode-${state.sidebarMode} ${state.customizeOpen ? 'customizer-is-open' : ''}">
      ${renderSidebar(tab)}
      <main class="browser-main">
        ${renderChrome(tab)}
        <div class="content-scroller">
          ${renderRoute(tab)}
        </div>
        ${renderStatusbar()}
      </main>
      ${state.customizeOpen ? renderCustomizer() : ''}
      ${state.commandOpen ? renderCommandPalette() : ''}
    </div>
  `;
  bindEvents();
}

function renderSidebar(tab) {
  const active = state.route;
  return `<aside class="sidebar" aria-label="Sreon sidebar">
    <div class="sidebar-top">
      <button class="brand-lockup" data-action="navigate" data-route="home" aria-label="Go to Sreon home">
        <img src="/brand/sreon-mark.svg" alt="Sreon logo" class="brand-mark" />
        <span class="brand-copy"><strong>sreon</strong><small>quiet browser</small></span>
      </button>
      <button class="icon-button sidebar-toggle" data-action="toggle-sidebar" aria-label="Toggle sidebar">${icon(state.sidebarMode === 'compact' ? 'chevron' : 'arrowLeft', 17)}</button>
    </div>
    <div class="sidebar-actions">
      <button class="new-tab-button" data-action="new-tab">${icon('plus', 17)}<span>New tab</span><kbd>⌘ T</kbd></button>
      <button class="command-button" data-action="command-palette">${icon('command', 16)}<span>Quick command</span><kbd>⌘ K</kbd></button>
    </div>
    <nav class="sidebar-nav" aria-label="Main navigation">
      <div class="nav-caption">Library</div>
      ${navItems.map(item => `<button class="nav-item ${active === item.id ? 'active' : ''}" data-action="navigate" data-route="${item.id}" title="${item.label}">${icon(item.icon, 18)}<span>${item.label}</span>${item.count ? `<em>${state.tabs.length}</em>` : ''}</button>`).join('')}
    </nav>
    <div class="sidebar-section-divider"></div>
    <div class="tabs-heading"><span class="nav-caption">Open tabs</span><button class="tiny-button" data-action="new-tab" aria-label="New tab">${icon('plus', 15)}</button></div>
    <div class="open-tabs" data-dropzone="tabs">
      ${state.tabs.map((item, index) => renderTabItem(item, index)).join('')}
    </div>
    <div class="sidebar-bottom">
      <button class="privacy-pill ${state.privacyShield ? 'enabled' : ''}" data-action="toggle-shield">
        <span class="privacy-dot">${icon(state.privacyShield ? 'shieldCheck' : 'shield', 15)}</span><span class="privacy-text"><strong>Privacy shield</strong><small>${state.privacyShield ? 'On for this window' : 'Paused for this window'}</small></span><span class="switch ${state.privacyShield ? 'on' : ''}"><i></i></span>
      </button>
      <button class="nav-item utility-item ${active === 'privacy' ? 'active' : ''}" data-action="navigate" data-route="privacy">${icon('shield', 18)}<span>Privacy</span></button>
      <button class="nav-item utility-item ${active === 'settings' ? 'active' : ''}" data-action="navigate" data-route="settings">${icon('settings', 18)}<span>Settings</span></button>
      <div class="profile-line"><span class="avatar">S</span><div><strong>Personal</strong><small>Local profile</small></div><button class="tiny-button" data-action="customize" aria-label="Customize sidebar">${icon('more', 16)}</button></div>
    </div>
  </aside>`;
}

function renderTabItem(tab, index) {
  const isActive = tab.id === state.activeTabId;
  return `<div class="tab-row ${isActive ? 'active' : ''} ${tab.pinned ? 'pinned' : ''}" data-tab-id="${tab.id}" draggable="true">
    <button class="tab-main" data-action="select-tab" data-tab-id="${tab.id}"><span class="tab-grip">${icon('drag', 14)}</span>${tabIcon(tab)}<span class="tab-label"><strong>${escapeHtml(tab.title)}</strong><small>${escapeHtml(tab.domain)}</small></span>${tab.playing ? `<span class="playing">${icon(tab.muted ? 'volumeOff' : 'volume', 13)}</span>` : ''}</button>
    <span class="tab-actions"><button data-action="${tab.pinned ? 'unpin-tab' : 'pin-tab'}" data-tab-id="${tab.id}" aria-label="${tab.pinned ? 'Unpin' : 'Pin'} tab">${icon('pin', 13)}</button><button data-action="toggle-mute" data-tab-id="${tab.id}" aria-label="${tab.muted ? 'Unmute' : 'Mute'} tab">${icon(tab.muted ? 'volumeOff' : 'volume', 13)}</button><button data-action="close-tab" data-tab-id="${tab.id}" aria-label="Close tab">${icon('close', 14)}</button></span>
  </div>`;
}

function renderChrome(tab) {
  const isHome = tab.url === 'sreon://home' && state.route === 'home';
  return `<header class="browser-chrome">
    <div class="window-controls" aria-label="Window navigation"><button class="chrome-button" data-action="go-back" aria-label="Back">${icon('arrowLeft', 17)}</button><button class="chrome-button muted" data-action="go-forward" aria-label="Forward">${icon('arrowRight', 17)}</button><button class="chrome-button" data-action="reload" aria-label="Reload">${icon('rotate', 16)}</button></div>
    <div class="address-wrap ${isHome ? 'home-address' : ''}"><span class="address-security">${tab.url.startsWith('https://') ? icon('lock', 14) : icon('spark', 14)}</span><input id="address-input" aria-label="Search or enter address" value="${escapeHtml(tab.url === 'sreon://home' ? '' : tab.url)}" placeholder="Search the web or enter an address" autocomplete="off"/><button class="address-action" data-action="bookmark-current" aria-label="Bookmark page">${icon('star', 16)}</button><button class="address-action" data-action="more-page" aria-label="Page actions">${icon('more', 16)}</button></div>
    <div class="chrome-right"><span class="secure-label">${state.privacyShield ? 'Protected' : 'Unprotected'}</span><button class="chrome-button shield-chrome ${state.privacyShield ? 'active' : ''}" data-action="toggle-shield" aria-label="Privacy shield">${icon('shieldCheck', 17)}</button><button class="chrome-button" data-action="customize" aria-label="Customize sidebar">${icon('sliders', 17)}</button></div>
  </header>`;
}

function renderRoute(tab) {
  if (tab.url !== 'sreon://home' && state.route === 'web') return renderWebView(tab);
  switch (state.route) {
    case 'search': return renderSearchPage();
    case 'tabs': return renderTabsPage();
    case 'bookmarks': return renderBookmarksPage();
    case 'history': return renderHistoryPage();
    case 'downloads': return renderDownloadsPage();
    case 'workspaces': return renderWorkspacesPage();
    case 'privacy': return renderPrivacyPage();
    case 'settings': return renderSettingsPage();
    default: return renderHome();
  }
}

function renderHome() {
  const tabCount = state.tabs.length;
  return `<section class="home-page page-enter">
    <div class="home-hero">
      <div class="hero-copy"><div class="eyebrow"><span class="eyebrow-dot"></span> SREON BROWSER <span class="eyebrow-line"></span> 01</div><h1>A little more room<br><em>to explore.</em></h1><p class="hero-intro">A calm, capable browser for the way you move through the web. Search, read, and make space for what matters.</p>
        <form class="hero-search" data-form="search"><span class="search-orb">${icon('search', 20)}</span><input name="query" placeholder="What are you curious about?" aria-label="Search the web"/><button type="submit">Explore <span>↗</span></button><div class="search-hint"><kbd>⌘</kbd><kbd>K</kbd></div></form>
        <div class="search-suggestions"><button data-search="Sreon browser">Sreon browser</button><button data-search="quiet places to explore">Quiet places</button><button data-search="inspiration for today">A little inspiration</button></div>
      </div>
      <div class="hero-art" aria-label="Abstract Sreon landscape illustration"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="sun-disc"></div><div class="mountain mountain-back"></div><div class="mountain mountain-front"></div><div class="art-star star-one">✦</div><div class="art-star star-two">·</div><span class="art-note">A QUIETER WAY<br>TO GET CURIOUS <b>↗</b></span></div>
    </div>
    <div class="home-grid">
      <article class="feature-card privacy-card"><div class="card-topline"><span class="card-label">01 / PRIVATE BY DEFAULT</span>${icon('shieldCheck', 19)}</div><h2>Keep the useful.<br><i>Leave the rest.</i></h2><p>Tracker blocking and a local-first profile come built in. No account needed to get started.</p><button class="text-link" data-action="navigate" data-route="privacy">See how privacy works ${icon('arrowRight', 15)}</button></article>
      <article class="feature-card space-card"><div class="card-topline"><span class="card-label">02 / YOUR SPACE</span>${icon('layers', 19)}</div><div class="space-stat"><strong>${String(tabCount).padStart(2, '0')}</strong><span>open<br>tabs</span></div><p>Keep projects in their own small worlds with Workspaces.</p><button class="text-link" data-action="navigate" data-route="workspaces">Open workspaces ${icon('arrowRight', 15)}</button></article>
      <article class="feature-card shortcuts-card"><div class="card-topline"><span class="card-label">03 / SMALL DETOURS</span>${icon('spark', 19)}</div><div class="detour-row"><span class="detour-icon">${icon('keyboard', 18)}</span><div><strong>Quick command</strong><small>Open anything, instantly</small></div><kbd>⌘ K</kbd></div><div class="detour-row"><span class="detour-icon">${icon('search', 18)}</span><div><strong>Search the web</strong><small>Start from anywhere</small></div><kbd>/</kbd></div></article>
    </div>
    <div class="home-footer-note"><span class="status-pulse"></span><span>Built for focus</span><span class="footer-separator">•</span><span>No account needed</span><span class="footer-separator">•</span><span>Open by nature</span><span class="footer-version">SREON / 1.0</span></div>
  </section>`;
}

function renderSearchPage() {
  const query = escapeHtml(state.query || '');
  return `<section class="content-page search-page page-enter"><div class="page-heading compact-heading"><div><div class="eyebrow">SEARCH <span class="eyebrow-line"></span> LIVE WEB</div><h1>Find your own way.</h1><p>Search the web, then take the scenic route.</p></div><button class="quiet-button" data-action="navigate" data-route="home">${icon('arrowLeft', 15)} Home</button></div>
    <form class="wide-search" data-form="search"><span>${icon('search', 19)}</span><input name="query" value="${query}" placeholder="Search the web" autofocus/><button type="submit">Search <span>↗</span></button></form>
    ${state.isSearching ? `<div class="search-loading"><span class="loader"></span><span>Looking around the web…</span></div>` : state.searchResults ? renderSearchResults() : `<div class="empty-panel search-empty"><div class="empty-illustration">${icon('search', 28)}</div><h2>Start with a question.</h2><p>Results from Wikipedia and the wider web will appear here. Sreon keeps the starting point simple.</p><div class="empty-links"><button data-search="designing a calmer digital life">Designing a calmer digital life</button><button data-search="best independent bookstores">Independent bookstores</button></div></div>`}
  </section>`;
}

function renderSearchResults() {
  const results = state.searchResults || [];
  return `<div class="results-toolbar"><div><strong>${results.length ? `${results.length} results` : 'No instant results'}</strong><span>for “${escapeHtml(state.query)}”</span></div><a class="external-link" href="https://duckduckgo.com/?q=${encodeURIComponent(state.query)}" target="_blank" rel="noreferrer">Open full web results ${icon('external', 14)}</a></div>
  <div class="results-list">${results.length ? results.map(result => `<article class="result-card"><div class="result-source"><span class="result-favicon">${result.icon ? tabIcon({ icon: result.icon, domain: result.domain }, 14) : icon('globe', 14)}</span><span>${escapeHtml(result.domain)}</span><span class="result-dot">•</span><span>${escapeHtml(result.type || 'Web result')}</span></div><h2>${escapeHtml(result.title)}</h2><p>${escapeHtml(result.description || 'Explore this result on the original website.')}</p><a href="${escapeHtml(result.url)}" target="_blank" rel="noreferrer">Open result ${icon('arrowRight', 14)}</a></article>`).join('') : `<div class="no-results"><div class="empty-illustration">${icon('globe', 27)}</div><h2>Nothing surfaced yet.</h2><p>Try the full web search for a broader result set.</p></div>`}</div>`;
}

function renderPageTitle(eyebrow, title, copy, action = '') { return `<div class="page-heading"><div><div class="eyebrow">${eyebrow} <span class="eyebrow-line"></span></div><h1>${title}</h1>${copy ? `<p>${copy}</p>` : ''}</div>${action}</div>`; }

function renderTabsPage() {
  return `<section class="content-page page-enter">${renderPageTitle('LIBRARY / 03', 'Open tabs.', 'Everything you have open, in one quiet place.', `<button class="primary-button" data-action="new-tab">${icon('plus', 16)} New tab</button>`)}<div class="tab-overview"><div class="overview-intro"><span class="big-number">${String(state.tabs.length).padStart(2, '0')}</span><span>active tabs<br>in this window</span></div><div class="overview-actions"><button class="soft-button" data-action="close-other-tabs">${icon('close', 15)} Close other tabs</button><button class="soft-button" data-action="duplicate-active">${icon('tabs', 15)} Duplicate active</button></div></div><div class="large-tab-list">${state.tabs.map((tab, index) => `<div class="large-tab-row"><span class="row-number">${String(index + 1).padStart(2, '0')}</span>${tabIcon(tab, 21)}<div class="large-tab-copy"><strong>${escapeHtml(tab.title)}</strong><span>${escapeHtml(tab.url)}</span></div>${tab.pinned ? `<span class="tag">Pinned</span>` : ''}<button class="row-icon" data-action="select-tab" data-tab-id="${tab.id}" aria-label="Open tab">${icon('arrowRight', 16)}</button><button class="row-icon" data-action="close-tab" data-tab-id="${tab.id}" aria-label="Close tab">${icon('close', 16)}</button></div>`).join('')}</div></section>`;
}

function renderBookmarksPage() {
  return `<section class="content-page page-enter">${renderPageTitle('LIBRARY / 04', 'Bookmarks.', 'The things worth finding again.', `<button class="primary-button" data-action="bookmark-current">${icon('plus', 16)} Save current page</button>`)}<div class="collection-head"><span>All bookmarks</span><span>${state.bookmarks.length} saved</span></div><div class="bookmark-grid">${state.bookmarks.map((item, index) => `<article class="bookmark-card"><div class="bookmark-card-top">${tabIcon(item, 22)}<button class="row-icon" data-action="remove-bookmark" data-index="${index}" aria-label="Remove bookmark">${icon('more', 16)}</button></div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.domain)}</span><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Open ${icon('external', 13)}</a></article>`).join('')}</div></section>`;
}

function renderHistoryPage() {
  return `<section class="content-page page-enter">${renderPageTitle('LIBRARY / 05', 'History.', 'A clear path back to where you started.', `<button class="quiet-button danger-button" data-action="clear-history">${icon('close', 15)} Clear history</button>`)}<div class="history-list">${state.history.map(item => `<div class="history-row">${tabIcon(item, 22)}<div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.url)}</span></div><time>${escapeHtml(item.time)}</time><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer" aria-label="Open history item">${icon('arrowRight', 17)}</a></div>`).join('') || `<div class="empty-panel"><div class="empty-illustration">${icon('history', 28)}</div><h2>Your history is clear.</h2><p>Pages you visit will show up here.</p></div>`}</div></section>`;
}

function renderDownloadsPage() {
  return `<section class="content-page page-enter">${renderPageTitle('LIBRARY / 06', 'Downloads.', 'Files from the web, kept close by.', `<button class="quiet-button" data-action="open-downloads">${icon('folder', 15)} Open folder</button>`)}<div class="download-list">${state.downloads.map(item => `<div class="download-row"><span class="file-icon">${icon('download', 19)}</span><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.size)} · ${escapeHtml(item.time)}</span></div><span class="file-type">${escapeHtml(item.type)}</span><button class="row-icon" data-action="more-download" aria-label="Download actions">${icon('more', 16)}</button></div>`).join('')}</div><div class="download-note"><span>${icon('info', 17)}</span><p>Downloads are saved to your system Downloads folder. Sreon never scans or uploads your files.</p></div></section>`;
}

function renderWorkspacesPage() {
  return `<section class="content-page page-enter">${renderPageTitle('LIBRARY / 07', 'Workspaces.', 'Give every part of your life a little more room.', `<button class="primary-button" data-action="new-workspace">${icon('plus', 16)} New workspace</button>`)}<div class="workspace-grid"><article class="workspace-card workspace-main"><div class="workspace-art art-home"><span>PERSONAL</span>${icon('spark', 23)}</div><div class="workspace-card-body"><div><strong>Personal</strong><span>3 tabs · Updated now</span></div><button class="row-icon" data-action="select-tab" data-tab-id="home-tab">${icon('arrowRight', 16)}</button></div></article><article class="workspace-card"><div class="workspace-art art-focus"><span>FOCUS</span>${icon('moon', 21)}</div><div class="workspace-card-body"><div><strong>Deep focus</strong><span>0 tabs · Ready when you are</span></div><button class="row-icon" data-action="new-tab">${icon('plus', 16)}</button></div></article><button class="new-workspace-card" data-action="new-workspace"><span>${icon('plus', 20)}</span><strong>Make space for something new</strong><small>New workspace</small></button></div></section>`;
}

function renderPrivacyPage() {
  return `<section class="content-page page-enter">${renderPageTitle('SREON / PRIVACY', 'Privacy, plainly.', 'A browser should tell you what it is doing.', `<span class="live-badge"><i></i> Shield ${state.privacyShield ? 'active' : 'paused'}</span>`)}<div class="privacy-hero"><div class="privacy-hero-icon">${icon('shieldCheck', 31)}</div><div><div class="eyebrow">THIS WINDOW</div><h2>${state.privacyShield ? 'You are browsing with room to breathe.' : 'Privacy shield is paused.'}</h2><p>${state.privacyShield ? 'Sreon is blocking known trackers and keeping this profile local.' : 'Turn the shield back on when you want tracker blocking for this window.'}</p></div><button class="primary-button" data-action="toggle-shield">${state.privacyShield ? 'Pause shield' : 'Enable shield'}</button></div><div class="privacy-grid"><div class="privacy-stat"><span class="stat-icon green">${icon('shieldCheck', 18)}</span><strong>Trackers blocked</strong><b>128</b><small>this session</small></div><div class="privacy-stat"><span class="stat-icon purple">${icon('eyeOff', 18)}</span><strong>Private profile</strong><b>Local</b><small>no account required</small></div><div class="privacy-stat"><span class="stat-icon cream">${icon('info', 18)}</span><strong>What this does</strong><b>Clear</b><small>not a VPN or anonymity tool</small></div></div><div class="plain-language"><div><div class="eyebrow">A NOTE FROM SREON</div><h2>Plain language,<br><i>not a promise the internet can’t keep.</i></h2></div><p>Your searches still go to search providers, and websites you visit have their own cookies and privacy practices. Sreon gives you a quieter starting point and makes those boundaries visible.</p></div></section>`;
}

function renderSettingsPage() {
  return `<section class="content-page settings-page page-enter">${renderPageTitle('SREON / SETTINGS', 'Make it yours.', 'A few thoughtful controls for your small window.', `<button class="quiet-button" data-action="customize">${icon('sliders', 15)} Customize sidebar</button>`)}<div class="settings-layout"><div class="settings-nav"><span class="settings-nav-active">Appearance</span><span>Privacy</span><span>Behavior</span><span>Shortcuts</span></div><div class="settings-panels"><section class="settings-section"><div class="settings-section-title"><div><h2>Appearance</h2><p>Set the tone for your browsing space.</p></div></div><div class="setting-row"><div class="setting-copy"><strong>Color theme</strong><span>Choose a light or dark Sreon.</span></div><div class="theme-choice"><button class="theme-swatch dark ${state.theme === 'dark' ? 'selected' : ''}" data-action="set-theme" data-theme="dark">${icon('moon', 14)} Dark</button><button class="theme-swatch light ${state.theme === 'light' ? 'selected' : ''}" data-action="set-theme" data-theme="light">${icon('sun', 14)} Light</button></div></div><div class="setting-row"><div class="setting-copy"><strong>Accent color</strong><span>A quiet highlight for active things.</span></div><div class="accent-choices">${['#ad92f7','#d99a77','#74b8ae','#e6c477'].map(color => `<button class="accent-dot ${state.accent === color ? 'selected' : ''}" style="--dot:${color}" data-action="set-accent" data-accent="${color}" aria-label="Set accent ${color}"></button>`).join('')}</div></div><div class="setting-row"><div class="setting-copy"><strong>Reduced motion</strong><span>Use fewer transitions throughout Sreon.</span></div>${renderSwitch('reducedMotion')}</div></section><section class="settings-section"><div class="settings-section-title"><div><h2>Privacy</h2><p>Small choices, visible consequences.</p></div></div><div class="setting-row"><div class="setting-copy"><strong>Block known trackers</strong><span>Protect this window with the privacy shield.</span></div>${renderSwitch('blockTrackers')}</div><div class="setting-row"><div class="setting-copy"><strong>Clear browsing data on quit</strong><span>History and session data leave with the window.</span></div>${renderSwitch('clearOnQuit')}</div></section><section class="settings-section"><div class="settings-section-title"><div><h2>Keyboard</h2><p>Everything important is close at hand.</p></div></div><div class="shortcut-row"><span>Command palette</span><kbd>⌘ K</kbd></div><div class="shortcut-row"><span>Focus search</span><kbd>/</kbd></div><div class="shortcut-row"><span>New tab</span><kbd>⌘ T</kbd></div></section></div></div></section>`;
}

function renderSwitch(key) { return `<button class="switch-control ${state.settings[key] ? 'on' : ''}" data-action="toggle-setting" data-setting="${key}" aria-label="Toggle ${key}"><span></span></button>`; }

function renderWebView(tab) {
  return `<section class="web-view page-enter"><div class="web-view-meta"><div>${tabIcon(tab, 18)}<span>Viewing the web</span></div><a href="${escapeHtml(tab.url)}" target="_blank" rel="noreferrer">Open original ${icon('external', 14)}</a></div><iframe src="${escapeHtml(tab.url)}" title="${escapeHtml(tab.title)}" loading="eager"></iframe><div class="web-view-fallback"><div class="empty-illustration">${icon('external', 25)}</div><h2>This site prefers its own window.</h2><p>Some websites do not allow embedded viewing. Open the original page to continue there.</p><a class="primary-button" href="${escapeHtml(tab.url)}" target="_blank" rel="noreferrer">Open ${escapeHtml(tab.domain)} ${icon('external', 15)}</a></div></section>`;
}

function renderStatusbar() {
  return `<div class="statusbar"><div><span class="status-pulse"></span><span>${state.privacyShield ? 'Privacy shield active' : 'Shield paused'}</span><span class="status-divider">·</span><span>Local profile</span></div><div><span>Ready</span><span class="status-divider">·</span><span>Sreon 1.0</span></div></div>`;
}

function renderCustomizer() {
  return `<div class="customizer-backdrop" data-action="close-customizer"></div><aside class="customizer glass-panel"><div class="panel-heading"><div><div class="eyebrow">SIDEBAR / 01</div><h2>Make it yours.</h2></div><button class="icon-button" data-action="close-customizer" aria-label="Close sidebar customization">${icon('close', 17)}</button></div><p class="panel-intro">Your sidebar is the front door. Keep it close, or let it fade away.</p><div class="customizer-section"><label>Sidebar mode</label><div class="mode-grid">${[['expanded','Expanded','Icon + name'],['compact','Compact','Icon only'],['floating','Floating','Over the web'],['auto','Auto-hide','At the edge']].map(([value,name,desc]) => `<button class="mode-choice ${state.sidebarMode === value ? 'selected' : ''}" data-action="set-sidebar-mode" data-mode="${value}">${icon(value === 'compact' ? 'more' : value === 'floating' ? 'layers' : value === 'auto' ? 'eyeOff' : 'tabs', 17)}<strong>${name}</strong><small>${desc}</small>${state.sidebarMode === value ? `<span class="selected-mark">${icon('check', 12)}</span>` : ''}</button>`).join('')}</div></div><div class="customizer-section"><div class="range-label"><label for="sidebar-width">Width</label><output>${state.sidebarWidth}px</output></div><input id="sidebar-width" type="range" min="220" max="340" value="${state.sidebarWidth}" data-action="set-sidebar-width"></div><div class="customizer-section"><div class="range-label"><label for="sidebar-opacity">Opacity</label><output>92%</output></div><input id="sidebar-opacity" type="range" min="70" max="100" value="92"></div><div class="customizer-section"><label>Visible sections</label><div class="section-toggles"><span>${icon('home', 15)} Library</span><span>${icon('tabs', 15)} Open tabs</span><span>${icon('shield', 15)} Privacy</span></div></div><div class="customizer-foot"><span>${icon('drag', 16)} Drag items in the sidebar to reorder</span><button class="text-link" data-action="reset-sidebar">Reset defaults</button></div></aside>`;
}

function renderCommandPalette() {
  const commands = [{ icon: 'search', title: 'Search the web', meta: 'Start a new search', action: 'focus-search' }, { icon: 'plus', title: 'New tab', meta: 'Open a fresh tab', action: 'new-tab' }, { icon: 'bookmark', title: 'Save current page', meta: 'Add to bookmarks', action: 'bookmark-current' }, { icon: 'shieldCheck', title: state.privacyShield ? 'Pause privacy shield' : 'Enable privacy shield', meta: 'Change protection for this window', action: 'toggle-shield' }, { icon: 'settings', title: 'Open settings', meta: 'Customize Sreon', action: 'navigate-settings' }];
  return `<div class="command-backdrop" data-action="close-command"><div class="command-palette" role="dialog" aria-label="Command palette" data-stop-propagation><div class="command-input"><span>${icon('search', 19)}</span><input id="command-input" placeholder="What do you want to do?" autofocus/><kbd>ESC</kbd></div><div class="command-list">${commands.map((command, index) => `<button class="command-item ${index === 0 ? 'selected' : ''}" data-action="${command.action}">${icon(command.icon, 17)}<span><strong>${command.title}</strong><small>${command.meta}</small></span><span class="command-arrow">${icon('arrowRight', 15)}</span></button>`).join('')}</div><div class="command-foot"><span>Navigate <kbd>↑</kbd><kbd>↓</kbd></span><span>Open <kbd>↵</kbd></span></div></div></div>`;
}

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach(element => element.addEventListener('click', handleAction));
  document.querySelectorAll('[data-form="search"]').forEach(form => form.addEventListener('submit', event => { event.preventDefault(); const query = form.querySelector('input[name="query"]')?.value.trim(); if (query) runSearch(query); }));
  document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', () => runSearch(button.dataset.search)));
  const address = document.querySelector('#address-input');
  if (address) address.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); navigateFromAddress(address.value); } });
  document.querySelectorAll('[data-tab-id]').forEach(row => { row.addEventListener('dragstart', event => { event.dataTransfer.setData('text/plain', row.dataset.tabId); row.classList.add('dragging'); }); row.addEventListener('dragend', () => row.classList.remove('dragging')); row.addEventListener('dragover', event => { event.preventDefault(); row.classList.add('drag-over'); }); row.addEventListener('dragleave', () => row.classList.remove('drag-over')); row.addEventListener('drop', event => { event.preventDefault(); row.classList.remove('drag-over'); reorderTabs(event.dataTransfer.getData('text/plain'), row.dataset.tabId); }); });
  const width = document.querySelector('#sidebar-width'); if (width) width.addEventListener('input', event => { state.sidebarWidth = Number(event.target.value); document.documentElement.style.setProperty('--sidebar-width', `${state.sidebarWidth}px`); const output = document.querySelector('.range-label output'); if (output) output.textContent = `${state.sidebarWidth}px`; });
  const commandInput = document.querySelector('#command-input'); if (commandInput) commandInput.addEventListener('input', event => filterCommands(event.target.value));
}

async function handleAction(event) {
  const el = event.currentTarget; const action = el.dataset.action;
  if (action === 'navigate') { state.route = el.dataset.route; if (state.route !== 'web') state.activeTabId = state.route === 'home' ? 'home-tab' : state.activeTabId; closeOverlays(); render(); return; }
  if (action === 'navigate-settings') { state.route = 'settings'; state.commandOpen = false; render(); return; }
  if (action === 'select-tab') { state.activeTabId = el.dataset.tabId; const selected = activeTab(); state.route = selected.url === 'sreon://home' ? 'home' : 'web'; render(); return; }
  if (action === 'new-tab') { createNewTab(); return; }
  if (action === 'close-tab') { closeTab(el.dataset.tabId); return; }
  if (action === 'pin-tab' || action === 'unpin-tab') { const found = state.tabs.find(t => t.id === el.dataset.tabId); if (found) found.pinned = action === 'pin-tab'; render(); return; }
  if (action === 'toggle-mute') { const found = state.tabs.find(t => t.id === el.dataset.tabId); if (found) { found.muted = !found.muted; found.playing = true; } render(); return; }
  if (action === 'duplicate-active') { const current = activeTab(); const copy = { ...current, id: makeId(), title: `${current.title} — copy`, pinned: false }; state.tabs.splice(state.tabs.findIndex(t => t.id === current.id) + 1, 0, copy); state.activeTabId = copy.id; render(); return; }
  if (action === 'close-other-tabs') { state.tabs = state.tabs.filter(tab => tab.id === state.activeTabId || tab.pinned); render(); return; }
  if (action === 'toggle-shield') { state.privacyShield = !state.privacyShield; render(); return; }
  if (action === 'customize') { state.customizeOpen = true; render(); return; }
  if (action === 'close-customizer') { state.customizeOpen = false; render(); return; }
  if (action === 'set-sidebar-mode') { state.sidebarMode = el.dataset.mode; render(); return; }
  if (action === 'set-sidebar-width') { state.sidebarWidth = Number(el.value); render(); return; }
  if (action === 'toggle-sidebar') { state.sidebarMode = state.sidebarMode === 'compact' ? 'expanded' : 'compact'; render(); return; }
  if (action === 'reset-sidebar') { state.sidebarMode = 'expanded'; state.sidebarWidth = 268; state.customizeOpen = false; render(); return; }
  if (action === 'set-theme') { state.theme = el.dataset.theme; localStorage.setItem('sreon-theme', state.theme); render(); return; }
  if (action === 'set-accent') { state.accent = el.dataset.accent; render(); return; }
  if (action === 'toggle-setting') { const key = el.dataset.setting; state.settings[key] = !state.settings[key]; render(); return; }
  if (action === 'command-palette') { state.commandOpen = true; render(); return; }
  if (action === 'close-command') { if (event.target === el) { state.commandOpen = false; render(); } return; }
  if (action === 'focus-search') { state.commandOpen = false; state.route = 'search'; render(); setTimeout(() => document.querySelector('.wide-search input')?.focus(), 30); return; }
  if (action === 'bookmark-current') { bookmarkCurrent(); return; }
  if (action === 'remove-bookmark') { state.bookmarks.splice(Number(el.dataset.index), 1); render(); return; }
  if (action === 'clear-history') { state.history = []; render(); return; }
  if (action === 'new-workspace') { showToast('New workspace created locally'); return; }
  if (action === 'open-downloads') { showToast('Downloads folder is available in your system file manager'); return; }
  if (action === 'more-page' || action === 'more-download') { showToast('More actions are coming to this page'); return; }
  if (action === 'reload') { const current = activeTab(); if (state.route === 'web') { const iframe = document.querySelector('.web-view iframe'); if (iframe) iframe.src = iframe.src; } else showToast('Sreon is up to date'); return; }
  if (action === 'go-back') { if (state.route === 'web') { window.history.back(); } else showToast('Nothing to go back to'); return; }
  if (action === 'go-forward') { if (state.route === 'web') { window.history.forward(); } else showToast('Nothing to go forward to'); return; }
}

function closeOverlays() { state.commandOpen = false; state.customizeOpen = false; }
function createNewTab() { const id = makeId(); state.tabs.push({ id, title: 'New tab', url: 'sreon://home', domain: 'Sreon', icon: 'sreon' }); state.activeTabId = id; state.route = 'home'; closeOverlays(); render(); }
function closeTab(id) { if (state.tabs.length === 1) return; const index = state.tabs.findIndex(tab => tab.id === id); state.tabs = state.tabs.filter(tab => tab.id !== id); if (state.activeTabId === id) { state.activeTabId = state.tabs[Math.max(0, index - 1)].id; const selected = activeTab(); state.route = selected.url === 'sreon://home' ? 'home' : 'web'; } render(); }
function reorderTabs(sourceId, targetId) { if (!sourceId || sourceId === targetId) return; const from = state.tabs.findIndex(tab => tab.id === sourceId); const to = state.tabs.findIndex(tab => tab.id === targetId); const [moved] = state.tabs.splice(from, 1); state.tabs.splice(to, 0, moved); render(); }
function bookmarkCurrent() { const tab = activeTab(); if (tab.url === 'sreon://home') { showToast('Open a page before saving a bookmark'); return; } if (!state.bookmarks.some(item => item.url === tab.url)) state.bookmarks.unshift({ title: tab.title, url: tab.url, domain: tab.domain, icon: tab.icon }); showToast('Saved to bookmarks'); if (state.route === 'bookmarks') render(); }
function navigateFromAddress(value) { const input = value.trim(); if (!input) { state.route = 'home'; render(); return; } if (/^(https?:\/\/|sreon:\/\/)/i.test(input)) { const url = input.startsWith('sreon://') ? input : input; if (url === 'sreon://home') { state.activeTabId = 'home-tab'; state.route = 'home'; render(); return; } openUrl(url); } else runSearch(input); }
function openUrl(url, title = url.replace(/^https?:\/\//, '').split('/')[0]) { let parsed; try { parsed = new URL(url.startsWith('http') ? url : `https://${url}`); } catch { runSearch(url); return; } const tab = activeTab(); tab.url = parsed.href; tab.domain = parsed.hostname.replace(/^www\./, ''); tab.title = title; tab.icon = tab.domain.includes('github') ? 'github' : tab.domain.includes('sreon') ? 'sreon' : 'globe'; state.route = 'web'; state.history.unshift({ title: tab.title, url: tab.url, time: 'Just now', icon: tab.icon }); render(); }

async function runSearch(query) {
  state.query = query; state.route = 'search'; state.searchResults = null; state.isSearching = true; closeOverlays(); render();
  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=6&namespace=0&format=json&origin=*`);
    const data = await response.json();
    const titles = data[1] || []; const descriptions = data[2] || []; const urls = data[3] || [];
    state.searchResults = titles.map((title, index) => ({ title, description: descriptions[index] || 'Read more on Wikipedia.', url: urls[index], domain: 'wikipedia.org', type: 'Wikipedia' }));
  } catch {
    state.searchResults = [{ title: `Search the web for “${query}”`, description: 'Open the full Sreon search in DuckDuckGo to see live web results.', url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`, domain: 'duckduckgo.com', type: 'Live web search' }];
  }
  state.isSearching = false; render();
}

function filterCommands(value) { document.querySelectorAll('.command-item').forEach(item => { item.style.display = item.textContent.toLowerCase().includes(value.toLowerCase()) ? '' : 'none'; }); }
function showToast(message) { document.querySelector('.sreon-toast')?.remove(); const toast = document.createElement('div'); toast.className = 'sreon-toast'; toast.innerHTML = `${icon('check', 15)}<span>${escapeHtml(message)}</span>`; document.body.appendChild(toast); setTimeout(() => toast.classList.add('show'), 10); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 220); }, 2600); }

window.addEventListener('keydown', event => {
  const mod = event.metaKey || event.ctrlKey;
  if (mod && event.key.toLowerCase() === 'k') { event.preventDefault(); state.commandOpen = !state.commandOpen; render(); return; }
  if (mod && event.key.toLowerCase() === 't') { event.preventDefault(); createNewTab(); return; }
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); state.route = 'search'; render(); setTimeout(() => document.querySelector('.wide-search input')?.focus(), 30); return; }
  if (event.key === 'Escape') { if (state.commandOpen || state.customizeOpen) { state.commandOpen = false; state.customizeOpen = false; render(); } }
});

state.theme = localStorage.getItem('sreon-theme') || 'dark';
render();
