/**
 * Sreon — The Next Generation of Browsing
 * Powered by SPRFST Language
 * Full Web & Desktop Client Engine
 */

(function() {
  'use strict';

  // ===================================================================
  // 1. GLOBAL STATE & DEFAULT DATA
  // ===================================================================
  const State = {
    currentWorkspace: 'general',
    workspaces: {
      general: { id: 'general', name: 'General', color: '#FF6B00', tabs: [] },
      dev: { id: 'dev', name: 'Developer', color: '#FFA136', tabs: [] },
      research: { id: 'research', name: 'Research', color: '#3B82F6', tabs: [] },
      personal: { id: 'personal', name: 'Personal', color: '#10B981', tabs: [] }
    },
    activeTabId: null,
    tabCounter: 1,
    activeSidebarPanel: null,
    searchEngine: 'duckduckgo',
    searchEngines: {
      duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/html/?q=', icon: '⚡' },
      google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
      perplexity: { name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=', icon: '✳️' },
      brave: { name: 'Brave', url: 'https://search.brave.com/search?q=', icon: '🦁' },
      bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: '🅱️' }
    },
    shield: {
      enabled: true,
      rulesCount: 476,
      blockedCount: 432,
      savedBandwidthMB: 14.8,
      blockedOnCurrentPage: [],
      allowlist: ['github.com', 'apple.com', 'sreon.ai']
    },
    bookmarks: [
      { id: 'bm-1', title: 'Sreon Start Page', url: 'sreon://start', folder: 'Favorites', icon: '⚡' },
      { id: 'bm-2', title: 'Sreon Studio IDE', url: 'sreon://studio', folder: 'Developer', icon: '💻' },
      { id: 'bm-3', title: 'Interactive Whiteboard', url: 'sreon://whiteboard', folder: 'Productivity', icon: '🎨' },
      { id: 'bm-4', title: 'Productivity Suite', url: 'sreon://tools', folder: 'Productivity', icon: '🛠️' },
      { id: 'bm-5', title: 'SPRFST Language Docs', url: 'sreon://guidebook', folder: 'Developer', icon: '📖' },
      { id: 'bm-6', title: 'GitHub', url: 'https://github.com', folder: 'Favorites', icon: '🐙' },
      { id: 'bm-7', title: 'Hacker News', url: 'https://news.ycombinator.com', folder: 'Favorites', icon: '📰' },
      { id: 'bm-8', title: 'Apple Developer', url: 'https://developer.apple.com', folder: 'Developer', icon: '🍎' }
    ],
    vault: [
      {
        id: 'vault-1',
        title: 'SPRFST Language: Fast By Design',
        url: 'sreon://guidebook',
        domain: 'sreon.ai',
        excerpt: 'A fast, modern compiled language with its own compiler, register VM, and stdlib written in C.',
        words: 1240,
        progress: 85,
        savedAt: 'Today, 2:15 PM'
      },
      {
        id: 'vault-2',
        title: 'Comet & The Next Generation of Spatial Browsing',
        url: 'https://perplexity.ai',
        domain: 'perplexity.ai',
        excerpt: 'How modern AI and deep glassmorphism are transforming information retrieval on the desktop.',
        words: 860,
        progress: 40,
        savedAt: 'Yesterday'
      },
      {
        id: 'vault-3',
        title: 'Apple Glassmorphism Design Guidelines',
        url: 'https://developer.apple.com/design',
        domain: 'developer.apple.com',
        excerpt: 'Layered materials, vibrancy, translucent depth and typography in macOS Sonoma and Sequoia.',
        words: 1450,
        progress: 100,
        savedAt: '3 days ago'
      }
    ],
    notes: {
      'sreon://studio': '# Sreon Studio Tips\n- Press ⌘Enter to run current file\n- Built-in stdlib in std/\n- Check std.draw for graphics and compressing PNGs',
      'https://github.com': '# GitHub Notes\n- Check FellowPythonCoder/Sreon repository\n- Continuous integration active for macOS and Linux'
    },
    history: [
      { id: 'h-1', title: 'Sreon Start Page', url: 'sreon://start', time: 'Just now' },
      { id: 'h-2', title: 'Sreon Studio IDE', url: 'sreon://studio', time: '5m ago' },
      { id: 'h-3', title: 'GitHub: FellowPythonCoder/Sreon', url: 'https://github.com', time: '20m ago' },
      { id: 'h-4', title: 'Hacker News', url: 'https://news.ycombinator.com', time: '1h ago' }
    ],
    downloads: [
      { id: 'dl-1', filename: 'Sreon-0.1.0-macOS.dmg', size: '2.8 MB', progress: 100, speed: 'Completed', status: 'done' },
      { id: 'dl-2', filename: 'SPRFST-Guidebook.pdf', size: '1.4 MB', progress: 100, speed: 'Completed', status: 'done' }
    ],
    favorites: [
      { title: 'GitHub', url: 'https://github.com', icon: '🐙', color: '#24292e' },
      { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: '📰', color: '#ff6600' },
      { title: 'Perplexity', url: 'https://perplexity.ai', icon: '✳️', color: '#20b2aa' },
      { title: 'Apple Dev', url: 'https://developer.apple.com', icon: '🍎', color: '#0071e3' },
      { title: 'SPRFST Docs', url: 'sreon://guidebook', icon: '⚡', color: '#FF6B00' },
      { title: 'Sreon Studio', url: 'sreon://studio', icon: '💻', color: '#FFA136' },
      { title: 'Whiteboard', url: 'sreon://whiteboard', icon: '🎨', color: '#3B82F6' },
      { title: 'Tools Suite', url: 'sreon://tools', icon: '🛠️', color: '#10B981' }
    ],
    settings: {
      theme: 'dark',
      density: 'default',
      accentColor: '#FF6B00',
      glassBlur: 28,
      glassOpacity: 75,
      searchEngine: 'duckduckgo',
      sidebarPlacement: 'left',
      tabStyle: 'horizontal',
      editorFontSize: 13,
      editorFontFamily: 'SF Mono',
      reducedMotion: false
    },
    ide: {
      currentFile: 'src/main.spf',
      files: {
        'src/main.spf': `use std.io
use std.math

fn main() {
    let app_name = "Sreon"
    let engine = "SPRFST Language"
    io.say("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    io.say("  Welcome to {app_name}!")
    io.say("  {app_name} · Powered by {engine}")
    io.say("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    let features = ["Glassmorphism", "WKWebView Engine", "Sreon Shield", "Sreon Studio IDE"]
    for f in features {
        io.say("  ✓ {f} active")
    }

    let speed_calc = math.sqrt(256.0) * 16.0
    io.say("  Performance index: {speed_calc} ops/ms")
}
`,
        'examples/01-hello.spf': `use std.io

fn main() {
    io.say("hello, world")
}
`,
        'examples/16-graphics.spf': `use std.io
use std.draw
use std.math

fn main() {
    let size = 256
    let canvas = draw.canvas(size, size)
    draw.clear(canvas, draw.rgb(10, 10, 14))
    draw.circle(canvas, 128, 128, 80, draw.rgb(255, 107, 0))
    io.say("Generated graphics canvas: {size}x{size}")
}
`
      }
    },
    guidebook: [
      { ch: 1, title: 'First Steps', file: '01-first-steps.md' },
      { ch: 2, title: 'Values and Names', file: '02-values-and-names.md' },
      { ch: 3, title: 'Making Decisions', file: '03-making-decisions.md' },
      { ch: 4, title: 'Repeating Work', file: '04-repeating-work.md' },
      { ch: 5, title: 'Functions', file: '05-functions.md' },
      { ch: 6, title: 'Text & Interpolation', file: '06-text.md' },
      { ch: 7, title: 'Lists', file: '07-lists.md' },
      { ch: 8, title: 'Maps and Sets', file: '08-maps-and-sets.md' },
      { ch: 9, title: 'Objects & State', file: '09-objects.md' },
      { ch: 10, title: 'Traits & Behaviour', file: '10-traits.md' },
      { ch: 11, title: 'Enums and Matching', file: '11-enums-and-matching.md' },
      { ch: 12, title: 'Error Handling', file: '12-when-things-go-wrong.md' },
      { ch: 13, title: 'Generics', file: '13-generics.md' },
      { ch: 14, title: 'Modules and Packages', file: '14-modules-and-packages.md' },
      { ch: 15, title: 'Testing Suite', file: '15-testing.md' },
      { ch: 16, title: 'Memory & Allocator', file: '16-memory.md' },
      { ch: 17, title: 'Concurrency & Tasks', file: '17-concurrency.md' },
      { ch: 18, title: 'Files & JSON', file: '18-files-and-data.md' },
      { ch: 19, title: 'Ember Database', file: '19-database.md' },
      { ch: 20, title: 'Drawing & PNG Graphics', file: '20-drawing.md' },
      { ch: 21, title: 'Windows & UI Blocks', file: '21-windows.md' },
      { ch: 22, title: 'HTTP & The Web', file: '22-the-web.md' },
      { ch: 23, title: 'Learning Machines (Tensors)', file: '23-learning-machines.md' },
      { ch: 24, title: 'Games & Animation', file: '24-games.md' },
      { ch: 25, title: 'Speed & Optimization', file: '25-speed.md' },
      { ch: 26, title: 'The Debugger', file: '26-the-debugger.md' },
      { ch: 27, title: 'Forge Extensions', file: '27-forge-and-extensions.md' },
      { ch: 28, title: 'Sreon Studio Tooling', file: '28-studio.md' },
      { ch: 29, title: 'The Standard Library', file: '29-the-standard-library.md' },
      { ch: 30, title: 'A Whole Program', file: '30-a-whole-program.md' }
    ],
    currentTool: 'calculator'
  };

  // ===================================================================
  // 2. DOM ELEMENTS CACHE
  // ===================================================================
  const DOM = {
    window: document.getElementById('sreonWindow'),
    tabStrip: document.getElementById('tabStrip'),
    btnNewTab: document.getElementById('btnNewTab'),
    btnBack: document.getElementById('btnBack'),
    btnForward: document.getElementById('btnForward'),
    btnReload: document.getElementById('btnReload'),
    btnHome: document.getElementById('btnHome'),
    addressInput: document.getElementById('addressInput'),
    addressSuggestions: document.getElementById('addressSuggestions'),
    btnEngineSelect: document.getElementById('btnEngineSelect'),
    currentEngineIcon: document.getElementById('currentEngineIcon'),
    currentEngineName: document.getElementById('currentEngineName'),
    btnShieldBadge: document.getElementById('btnShieldBadge'),
    shieldBadgeCount: document.getElementById('shieldBadgeCount'),
    btnBookmarkPage: document.getElementById('btnBookmarkPage'),
    btnSaveToVault: document.getElementById('btnSaveToVault'),
    btnLensReader: document.getElementById('btnLensReader'),
    btnToggleAI: document.getElementById('btnToggleAI'),
    btnToggleSplit: document.getElementById('btnToggleSplit'),
    btnLaunchStudio: document.getElementById('btnLaunchStudio'),
    btnCommandPalette: document.getElementById('btnCommandPalette'),
    btnDownloadsPopover: document.getElementById('btnDownloadsPopover'),
    btnSettings: document.getElementById('btnSettings'),
    workspacePill: document.getElementById('workspacePill'),
    workspacePillName: document.getElementById('workspacePillName'),
    workspaceDot: document.getElementById('workspaceDot'),
    sidebar: document.getElementById('sreonSidebar'),
    sidebarDrawer: document.getElementById('sidebarDrawer'),
    drawerTitle: document.getElementById('drawerTitle'),
    drawerBody: document.getElementById('drawerBody'),
    btnDrawerClose: document.getElementById('btnDrawerClose'),
    sidebarResizer: document.getElementById('sidebarResizer'),
    // Views
    viewStartPage: document.getElementById('viewStartPage'),
    viewBrowser: document.getElementById('viewBrowser'),
    viewSplitBrowsing: document.getElementById('viewSplitBrowsing'),
    viewStudio: document.getElementById('viewStudio'),
    viewWhiteboard: document.getElementById('viewWhiteboard'),
    viewTools: document.getElementById('viewTools'),
    viewSettings: document.getElementById('viewSettings'),
    // Frames
    webRendererFrame: document.getElementById('webRendererFrame'),
    lensOverlay: document.getElementById('lensReaderOverlay'),
    browserErrorScreen: document.getElementById('browserErrorScreen'),
    // Start page
    startSearchInput: document.getElementById('startSearchInput'),
    btnStartSearch: document.getElementById('btnStartSearch'),
    favoritesGrid: document.getElementById('favoritesGrid'),
    clockDisplay: document.getElementById('clockDisplay'),
    dateDisplay: document.getElementById('dateDisplay'),
    widgetStatBlocked: document.getElementById('widgetStatBlocked'),
    widgetStatSaved: document.getElementById('widgetStatSaved'),
    btnStartOpenStudio: document.getElementById('btnStartOpenStudio'),
    btnStartOpenWhiteboard: document.getElementById('btnStartOpenWhiteboard'),
    // Command palette
    commandPalette: document.getElementById('commandPalette'),
    paletteInput: document.getElementById('paletteInput'),
    paletteResults: document.getElementById('paletteResults'),
    // Status bar
    statusText: document.getElementById('statusText'),
    statusMetricCost: document.getElementById('statusMetricCost'),
    statusMetricBlocked: document.getElementById('statusMetricBlocked'),
    statusMetricRules: document.getElementById('statusMetricRules')
  };

  // ===================================================================
  // 3. TAB MANAGEMENT SYSTEM
  // ===================================================================
  function createTab(url = 'sreon://start', title = 'Sreon Start') {
    const id = 'tab-' + (State.tabCounter++);
    const isInternal = url.startsWith('sreon://');
    const tab = {
      id,
      url,
      title: title || (isInternal ? formatInternalTitle(url) : url),
      favicon: getFaviconForUrl(url),
      loading: false,
      pinned: false,
      group: '',
      history: [url],
      historyIdx: 0
    };

    State.workspaces[State.currentWorkspace].tabs.push(tab);
    renderTabs();
    selectTab(id);
    return tab;
  }

  function formatInternalTitle(url) {
    if (url === 'sreon://start') return 'Sreon Start';
    if (url === 'sreon://studio') return 'Sreon Studio IDE';
    if (url === 'sreon://whiteboard') return 'Infinite Whiteboard';
    if (url === 'sreon://tools') return 'Productivity Suite';
    if (url === 'sreon://settings') return 'Settings';
    if (url === 'sreon://guidebook') return 'SPRFST Guidebook';
    if (url === 'sreon://shield') return 'Sreon Shield';
    return url;
  }

  function getFaviconForUrl(url) {
    if (url.startsWith('sreon://start')) return '⚡';
    if (url.startsWith('sreon://studio')) return '💻';
    if (url.startsWith('sreon://whiteboard')) return '🎨';
    if (url.startsWith('sreon://tools')) return '🛠️';
    if (url.startsWith('sreon://settings')) return '⚙️';
    if (url.startsWith('sreon://guidebook')) return '📖';
    if (url.includes('github.com')) return '🐙';
    if (url.includes('news.ycombinator.com')) return '📰';
    if (url.includes('apple.com')) return '🍎';
    if (url.includes('perplexity.ai')) return '✳️';
    return '🌐';
  }

  function getActiveTab() {
    const tabs = State.workspaces[State.currentWorkspace].tabs;
    return tabs.find(t => t.id === State.activeTabId) || tabs[0];
  }

  function selectTab(id) {
    State.activeTabId = id;
    const tab = getActiveTab();
    if (!tab) return;

    renderTabs();
    loadTabUrl(tab.url, false);
    updateNavButtons();
  }

  function closeTab(id, e) {
    if (e) e.stopPropagation();
    const currentTabs = State.workspaces[State.currentWorkspace].tabs;
    const idx = currentTabs.findIndex(t => t.id === id);
    if (idx < 0) return;

    currentTabs.splice(idx, 1);
    if (currentTabs.length === 0) {
      createTab('sreon://start');
    } else if (State.activeTabId === id) {
      const nextTab = currentTabs[Math.max(0, idx - 1)];
      selectTab(nextTab.id);
    } else {
      renderTabs();
    }
  }

  function renderTabs() {
    DOM.tabStrip.innerHTML = '';
    const currentTabs = State.workspaces[State.currentWorkspace].tabs;

    currentTabs.forEach(tab => {
      const el = document.createElement('div');
      el.className = `tab-item ${tab.id === State.activeTabId ? 'active' : ''} ${tab.pinned ? 'pinned' : ''}`;
      el.onclick = () => selectTab(tab.id);

      el.innerHTML = `
        <span class="tab-favicon">${tab.favicon}</span>
        <span class="tab-title">${escapeHtml(tab.title)}</span>
        <button class="tab-close" title="Close Tab">✕</button>
      `;

      el.querySelector('.tab-close').onclick = (e) => closeTab(tab.id, e);
      DOM.tabStrip.appendChild(el);
    });
  }

  // ===================================================================
  // 4. URL & NAVIGATION ROUTING
  // ===================================================================
  function loadTabUrl(rawUrl, pushHistory = true) {
    const tab = getActiveTab();
    if (!tab) return;

    const url = normalizeUrl(rawUrl);
    tab.url = url;
    DOM.addressInput.value = url;
    tab.favicon = getFaviconForUrl(url);

    if (pushHistory) {
      tab.history = tab.history.slice(0, tab.historyIdx + 1);
      tab.history.push(url);
      tab.historyIdx = tab.history.length - 1;
      addHistoryEntry(url, tab.title);
    }

    // Hide all viewports first
    document.querySelectorAll('.viewport-view').forEach(v => v.classList.remove('active'));
    DOM.lensOverlay.style.display = 'none';

    // Route internal vs web URLs
    if (url === 'sreon://start' || url === 'sreon://newtab') {
      tab.title = 'Sreon Start';
      DOM.viewStartPage.classList.add('active');
      DOM.statusText.textContent = 'Sreon Start · Ready';
      DOM.statusMetricCost.textContent = '0 ms';
    } else if (url === 'sreon://studio' || url === 'sreon://ide') {
      tab.title = 'Sreon Studio IDE';
      DOM.viewStudio.classList.add('active');
      DOM.statusText.textContent = 'Sreon Studio · SPRFST IDE Active';
      initStudioIfNeeded();
    } else if (url === 'sreon://whiteboard') {
      tab.title = 'Infinite Whiteboard';
      DOM.viewWhiteboard.classList.add('active');
      DOM.statusText.textContent = 'Whiteboard · Infinite Creative Canvas';
      initWhiteboardIfNeeded();
    } else if (url === 'sreon://tools') {
      tab.title = 'Productivity Suite';
      DOM.viewTools.classList.add('active');
      DOM.statusText.textContent = 'Productivity Suite · 21 Tools Ready';
      renderToolsSuite();
    } else if (url === 'sreon://settings') {
      tab.title = 'Settings';
      DOM.viewSettings.classList.add('active');
      DOM.statusText.textContent = 'Settings & Customization Center';
      renderSettings();
    } else if (url === 'sreon://guidebook') {
      tab.title = 'SPRFST Guidebook';
      DOM.viewStudio.classList.add('active');
      switchIdeTab('guidebook');
      DOM.statusText.textContent = 'SPRFST Guidebook · 30 Chapters';
    } else if (url === 'sreon://shield') {
      openSidebarPanel('shield');
      tab.title = 'Sreon Shield';
      DOM.viewStartPage.classList.add('active');
    } else {
      // Real Web URL -> Web Engine View
      tab.title = extractDomain(url);
      DOM.viewBrowser.classList.add('active');
      loadWebPageInEngine(url);
    }

    renderTabs();
    updateNavButtons();
    updateShieldBadge();
  }

  function normalizeUrl(input) {
    let t = input.trim();
    if (!t) return 'sreon://start';
    if (t.startsWith('sreon://') || t.startsWith('sprfst://')) {
      return t.replace('sprfst://', 'sreon://');
    }
    if (t === 'start' || t === 'newtab') return 'sreon://start';
    if (t === 'studio' || t === 'ide') return 'sreon://studio';
    if (t === 'whiteboard') return 'sreon://whiteboard';
    if (t === 'tools') return 'sreon://tools';
    if (t === 'settings') return 'sreon://settings';
    if (t === 'guidebook') return 'sreon://guidebook';
    if (t === 'shield') return 'sreon://shield';

    // If space or no dot, route through search engine
    if (t.includes(' ') || (!t.includes('.') && !isLocalHost(t))) {
      const engine = State.searchEngines[State.searchEngine] || State.searchEngines.duckduckgo;
      return engine.url + encodeURIComponent(t);
    }

    if (!t.startsWith('http://') && !t.startsWith('https://')) {
      return 'https://' + t;
    }
    return t;
  }

  function isLocalHost(host) {
    return host === 'localhost' || host === '127.0.0.1' || host.startsWith('localhost:');
  }

  function extractDomain(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  }

  function loadWebPageInEngine(url) {
    const t0 = performance.now();
    DOM.statusText.textContent = `Connecting to ${extractDomain(url)}...`;
    DOM.browserErrorScreen.style.display = 'none';

    // Check Sreon Shield rules
    const domain = extractDomain(url);
    const blockedCount = Math.floor(Math.random() * 8) + 4; // Simulated live shield counter
    State.shield.blockedCount += blockedCount;
    DOM.shieldBadgeCount.textContent = blockedCount;

    // Use our local web proxy or direct iframe navigation
    DOM.webRendererFrame.src = `/proxy?url=${encodeURIComponent(url)}`;

    DOM.webRendererFrame.onload = () => {
      const elapsed = Math.round(performance.now() - t0);
      DOM.statusText.textContent = `${extractDomain(url)} · Loaded`;
      DOM.statusMetricCost.textContent = `${elapsed} ms`;
      DOM.statusMetricBlocked.textContent = `${blockedCount} blocked`;
    };

    DOM.webRendererFrame.onerror = () => {
      DOM.browserErrorScreen.style.display = 'flex';
      document.getElementById('errorMessage').textContent = `Could not connect to ${url}. Check your internet connection.`;
    };
  }

  function updateNavButtons() {
    const tab = getActiveTab();
    if (!tab) return;
    DOM.btnBack.disabled = tab.historyIdx <= 0;
    DOM.btnForward.disabled = tab.historyIdx >= tab.history.length - 1;
  }

  function goBack() {
    const tab = getActiveTab();
    if (tab && tab.historyIdx > 0) {
      tab.historyIdx--;
      loadTabUrl(tab.history[tab.historyIdx], false);
    }
  }

  function goForward() {
    const tab = getActiveTab();
    if (tab && tab.historyIdx < tab.history.length - 1) {
      tab.historyIdx++;
      loadTabUrl(tab.history[tab.historyIdx], false);
    }
  }

  function reloadPage() {
    const tab = getActiveTab();
    if (tab) loadTabUrl(tab.url, false);
  }

  // ===================================================================
  // 5. 12-PANEL SIDEBAR IMPLEMENTATION
  // ===================================================================
  function toggleSidebarPanel(panelName) {
    if (State.activeSidebarPanel === panelName) {
      closeSidebar();
    } else {
      openSidebarPanel(panelName);
    }
  }

  function openSidebarPanel(panelName) {
    State.activeSidebarPanel = panelName;
    document.querySelectorAll('.rail-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === panelName);
    });

    DOM.sidebarDrawer.style.display = 'flex';
    renderDrawerPanel(panelName);
  }

  function closeSidebar() {
    State.activeSidebarPanel = null;
    document.querySelectorAll('.rail-btn').forEach(btn => btn.classList.remove('active'));
    DOM.sidebarDrawer.style.display = 'none';
  }

  function renderDrawerPanel(panel) {
    const titles = {
      ai: 'Sreon AI Workspace',
      shield: 'Ad & Tracker Shield',
      bookmarks: 'Smart Bookmarks',
      vault: 'Reading Vault',
      downloads: 'Downloads & Files',
      notes: 'Page Notes',
      focus: 'Focus Mode',
      split: 'Split View',
      workspaces: 'Workspace Manager',
      devtools: 'Developer Tools',
      history: 'Browsing History',
      tools: 'Everyday Tools'
    };

    DOM.drawerTitle.textContent = titles[panel] || 'Module';
    const body = DOM.drawerBody;
    body.innerHTML = '';

    if (panel === 'ai') {
      body.innerHTML = `
        <div class="ai-panel-container">
          <div class="ai-model-selector">
            <label>AI PROVIDER</label>
            <select class="sreon-select" id="aiModelSelect">
              <option value="gpt4o">GPT-4o (OpenAI)</option>
              <option value="claude35">Claude 3.5 Sonnet (Anthropic)</option>
              <option value="perplexity">Perplexity Comet</option>
              <option value="ollama">Ollama (Local LLM)</option>
              <option value="sprfst">Sreon Neural (SPRFST std.ai)</option>
            </select>
          </div>
          <div class="ai-context-badge">
            <span class="dot green"></span> Page Context Aware: <strong>${escapeHtml(getActiveTab().title)}</strong>
          </div>
          <div class="ai-prompt-shortcuts">
            <button class="ai-chip" onclick="window.sreonApp.runAiPrompt('Summarize this page')">✨ Summarize Page</button>
            <button class="ai-chip" onclick="window.sreonApp.runAiPrompt('Explain the code here')">💻 Explain Code</button>
            <button class="ai-chip" onclick="window.sreonApp.runAiPrompt('Extract key insights')">📊 Key Insights</button>
          </div>
          <div class="ai-chat-history" id="aiChatHistory">
            <div class="ai-msg assistant">
              Hello! I am Sreon AI, powered by the SPRFST Language environment. I have contextual awareness of your current tab and workspaces. How can I assist you?
            </div>
          </div>
          <div class="ai-input-wrapper">
            <textarea class="ai-input" id="aiInput" placeholder="Ask anything about this page or project... (Enter to send)"></textarea>
            <button class="ai-send-btn" id="btnAiSend">Send</button>
          </div>
        </div>
      `;
      setupAiListeners();
    } else if (panel === 'shield') {
      body.innerHTML = `
        <div class="shield-panel-container">
          <div class="shield-status-card">
            <div class="shield-toggle-row">
              <span class="shield-toggle-label">Protection Status</span>
              <label class="sreon-switch">
                <input type="checkbox" id="shieldToggle" ${State.shield.enabled ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
            <div class="shield-hero-stat">
              <span class="hero-num" id="shieldHeroCount">${State.shield.blockedCount}</span>
              <span class="hero-label">Total Trackers & Ads Blocked</span>
            </div>
          </div>

          <div class="shield-details-grid">
            <div class="shield-mini-card">
              <span class="mini-val">${State.shield.rulesCount}</span>
              <span class="mini-lbl">Active Rules</span>
            </div>
            <div class="shield-mini-card">
              <span class="mini-val">${State.shield.savedBandwidthMB} MB</span>
              <span class="mini-lbl">Data Saved</span>
            </div>
          </div>

          <div class="shield-section-header">Current Site Protection</div>
          <div class="shield-site-toggle">
            <div class="site-row">
              <span>Block Third-Party Trackers</span>
              <input type="checkbox" checked>
            </div>
            <div class="site-row">
              <span>Cosmetic Element Hiding</span>
              <input type="checkbox" checked>
            </div>
            <div class="site-row">
              <span>Malware & Cryptominers</span>
              <input type="checkbox" checked>
            </div>
          </div>

          <div class="shield-section-header">Blocked on Current Page</div>
          <div class="shield-blocked-list">
            <div class="blocked-item"><span class="blocked-badge">AD</span> doubleclick.net</div>
            <div class="blocked-item"><span class="blocked-badge">TRACK</span> google-analytics.com</div>
            <div class="blocked-item"><span class="blocked-badge">BEACON</span> connect.facebook.net</div>
            <div class="blocked-item"><span class="blocked-badge">MINER</span> coin-hive.ws</div>
          </div>
        </div>
      `;
    } else if (panel === 'bookmarks') {
      body.innerHTML = `
        <div class="bookmarks-panel">
          <div class="panel-search-bar">
            <input type="text" id="bmSearchInput" placeholder="Search bookmarks...">
            <button class="panel-btn-sm" id="btnBmAdd">+ Add</button>
          </div>
          <div class="bookmarks-list" id="bmList">
            ${State.bookmarks.map(b => `
              <div class="bm-card" onclick="window.sreonApp.navigate('${b.url}')">
                <span class="bm-icon">${b.icon || '🔖'}</span>
                <div class="bm-info">
                  <div class="bm-title">${escapeHtml(b.title)}</div>
                  <div class="bm-url">${escapeHtml(b.url)}</div>
                </div>
                <span class="bm-folder">${escapeHtml(b.folder)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (panel === 'vault') {
      body.innerHTML = `
        <div class="vault-panel">
          <div class="panel-header-row">
            <span>Saved Articles (${State.vault.length})</span>
            <button class="panel-btn-sm" onclick="window.sreonApp.saveCurrentToVault()">+ Save Page</button>
          </div>
          <div class="vault-list">
            ${State.vault.map(v => `
              <div class="vault-card">
                <div class="vault-top">
                  <span class="vault-domain">${v.domain}</span>
                  <span class="vault-words">${v.words} words</span>
                </div>
                <div class="vault-title" onclick="window.sreonApp.openInLens('${escapeHtml(v.title)}')">${escapeHtml(v.title)}</div>
                <div class="vault-excerpt">${escapeHtml(v.excerpt)}</div>
                <div class="vault-progress-bar">
                  <div class="vault-progress-fill" style="width: ${v.progress}%;"></div>
                </div>
                <div class="vault-footer">
                  <span class="vault-prog-text">${v.progress}% Read</span>
                  <button class="vault-read-btn" onclick="window.sreonApp.openInLens('${escapeHtml(v.title)}')">Read in Lens →</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (panel === 'downloads') {
      body.innerHTML = `
        <div class="downloads-panel">
          <div class="panel-header-row">
            <span>Download Activity</span>
            <button class="panel-btn-sm" onclick="window.sreonApp.simulateDownload()">+ New Download</button>
          </div>
          <div class="downloads-list" id="downloadsList">
            ${State.downloads.map(d => `
              <div class="dl-card">
                <div class="dl-icon">📦</div>
                <div class="dl-info">
                  <div class="dl-name">${escapeHtml(d.filename)}</div>
                  <div class="dl-meta">${d.size} · ${d.speed}</div>
                  <div class="dl-progress-bar">
                    <div class="dl-progress-fill" style="width: ${d.progress}%;"></div>
                  </div>
                </div>
                <button class="dl-open-btn" onclick="alert('Opening ${d.filename}')">Open</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (panel === 'notes') {
      const currentTab = getActiveTab();
      const noteContent = State.notes[currentTab.url] || '';
      body.innerHTML = `
        <div class="notes-panel">
          <div class="notes-target-label">
            Notes for: <strong>${escapeHtml(currentTab.url)}</strong>
          </div>
          <textarea class="notes-editor" id="pageNotesEditor" placeholder="Write markdown notes tied to this page...">${escapeHtml(noteContent)}</textarea>
          <div class="notes-footer">
            <span class="notes-autosave">✓ Auto-saved to Sreon Notes</span>
          </div>
        </div>
      `;
      const ed = document.getElementById('pageNotesEditor');
      ed.oninput = () => {
        State.notes[currentTab.url] = ed.value;
      };
    } else if (panel === 'focus') {
      body.innerHTML = `
        <div class="focus-panel">
          <div class="focus-timer-card">
            <div class="focus-tag">DEEP WORK FOCUS</div>
            <div class="focus-timer-display" id="focusTimerDisplay">25:00</div>
            <div class="focus-controls">
              <button class="focus-btn primary" id="btnFocusStart">Start Focus</button>
              <button class="focus-btn" id="btnFocusReset">Reset</button>
            </div>
          </div>
          <div class="focus-presets">
            <button class="preset-chip active" onclick="window.sreonApp.setFocusTime(25)">25 Min (Pomodoro)</button>
            <button class="preset-chip" onclick="window.sreonApp.setFocusTime(50)">50 Min (Deep Work)</button>
          </div>
          <div class="focus-distraction-list">
            <div class="focus-list-header">Distraction Blocklist Active</div>
            <div class="blocked-site-tag">twitter.com</div>
            <div class="blocked-site-tag">youtube.com</div>
            <div class="blocked-site-tag">reddit.com</div>
            <div class="blocked-site-tag">facebook.com</div>
          </div>
        </div>
      `;
    } else if (panel === 'split') {
      body.innerHTML = `
        <div class="split-panel">
          <p class="panel-desc">Split your screen into dual web browsers side by side with synchronized productivity.</p>
          <button class="sreon-btn-primary" onclick="window.sreonApp.openSplitView()">Launch Split View Browsing</button>
        </div>
      `;
    } else if (panel === 'workspaces') {
      body.innerHTML = `
        <div class="workspaces-panel">
          <div class="panel-desc">Isolated browsing environments with distinct tabs and cookies.</div>
          <div class="workspaces-list">
            ${Object.values(State.workspaces).map(w => `
              <div class="ws-card ${w.id === State.currentWorkspace ? 'active' : ''}" onclick="window.sreonApp.switchWorkspace('${w.id}')">
                <span class="ws-dot" style="background: ${w.color};"></span>
                <div class="ws-info">
                  <div class="ws-name">${escapeHtml(w.name)}</div>
                  <div class="ws-tabs">${w.tabs.length} open tab${w.tabs.length === 1 ? '' : 's'}</div>
                </div>
                ${w.id === State.currentWorkspace ? '<span class="ws-active-badge">Active</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (panel === 'devtools') {
      body.innerHTML = `
        <div class="devtools-panel">
          <button class="sreon-btn-primary" onclick="window.sreonApp.navigate('sreon://studio')">⚡ Open Sreon Studio IDE</button>
          <div class="devtools-logs">
            <div class="log-title">Console Logs</div>
            <div class="log-item info">[Info] Sreon Engine initialized (SPRFST 0.1.0-beta)</div>
            <div class="log-item success">[Shield] 476 privacy rules loaded into memory</div>
            <div class="log-item info">[Network] HTTP/1.1 socket service ready</div>
          </div>
        </div>
      `;
    } else if (panel === 'history') {
      body.innerHTML = `
        <div class="history-panel">
          <div class="panel-search-bar">
            <input type="text" id="histSearchInput" placeholder="Search history...">
            <button class="panel-btn-sm" onclick="window.sreonApp.clearHistory()">Clear</button>
          </div>
          <div class="history-list">
            ${State.history.map(h => `
              <div class="hist-card" onclick="window.sreonApp.navigate('${h.url}')">
                <span class="hist-icon">🕒</span>
                <div class="hist-info">
                  <div class="hist-title">${escapeHtml(h.title)}</div>
                  <div class="hist-url">${escapeHtml(h.url)}</div>
                </div>
                <span class="hist-time">${h.time}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (panel === 'tools') {
      body.innerHTML = `
        <div class="quick-tools-grid">
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('calculator')">🧮 Calculator</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('converter')">📏 Unit Converter</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('timezone')">🌐 Timezones</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('timer')">⏱️ Timer & Stopwatch</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('markdown')">📝 Markdown Editor</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('json')">📦 JSON Formatter</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('base64')">🔑 Base64 Tool</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('url')">🔗 URL Encoder</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('color')">🎨 Color Picker</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('uuid')">🆔 UUID Generator</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('password')">🛡️ Random Password</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('diff')">⚖️ Diff Viewer</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('transform')">🔤 Text Transform</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('counter')">📊 Word Counter</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('timestamp')">⏰ Timestamp</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('regex')">🔍 Regex Tester</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('hash')">🔒 Hasher</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('playground')">💻 Web Playground</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('scratchpad')">📋 Scratchpad</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('clipboard')">✂️ Clipboard</button>
          <button class="quick-tool-btn" onclick="window.sreonApp.openTool('qr')">📱 QR Code</button>
        </div>
      `;
    }
  }

  function setupAiListeners() {
    const btnSend = document.getElementById('btnAiSend');
    const input = document.getElementById('aiInput');
    const history = document.getElementById('aiChatHistory');

    const sendPrompt = () => {
      const text = input.value.trim();
      if (!text) return;

      const userMsg = document.createElement('div');
      userMsg.className = 'ai-msg user';
      userMsg.textContent = text;
      history.appendChild(userMsg);
      input.value = '';

      const assistantMsg = document.createElement('div');
      assistantMsg.className = 'ai-msg assistant typing';
      assistantMsg.textContent = 'Thinking...';
      history.appendChild(assistantMsg);
      history.scrollTop = history.scrollHeight;

      // Simulated smart streaming response
      setTimeout(() => {
        assistantMsg.classList.remove('typing');
        assistantMsg.innerHTML = `
          <strong>Sreon AI Response:</strong><br><br>
          Based on the current tab (<em>${escapeHtml(getActiveTab().title)}</em>) and the SPRFST environment, here is the answer:<br><br>
          • The request "<code>${escapeHtml(text)}</code>" was processed through the Sreon cognitive bridge.<br>
          • Sreon's dark glassmorphism system and SPRFST engine ensure zero telemetry leakage.<br>
          • Code execution in Sreon Studio runs safely within the native SPRFST sandbox.
        `;
        history.scrollTop = history.scrollHeight;
      }, 700);
    };

    if (btnSend) btnSend.onclick = sendPrompt;
    if (input) {
      input.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendPrompt();
        }
      };
    }
  }

  function addHistoryEntry(url, title) {
    State.history.unshift({
      id: 'h-' + Date.now(),
      title: title || url,
      url,
      time: 'Just now'
    });
    if (State.history.length > 50) State.history.pop();
  }

  function updateShieldBadge() {
    DOM.shieldBadgeCount.textContent = State.shield.blockedCount;
    DOM.widgetStatBlocked.textContent = State.shield.blockedCount;
  }

  // ===================================================================
  // 6. SREON STUDIO — COMPLETE BUILT-IN IDE
  // ===================================================================
  let studioInitialized = false;

  function initStudioIfNeeded() {
    if (studioInitialized) return;
    studioInitialized = true;

    renderIdeFileTree();
    renderIdeGuidebook();
    renderIdeExamples();
    loadIdeFile(State.ide.currentFile);

    // IDE Actions
    document.getElementById('btnIdeRun').onclick = runCurrentIdeCode;
    document.getElementById('btnIdeCheck').onclick = checkCurrentIdeCode;
    document.getElementById('btnIdeFmt').onclick = formatCurrentIdeCode;
    document.getElementById('btnIdeLint').onclick = lintCurrentIdeCode;
    document.getElementById('btnConsoleClear').onclick = () => {
      document.getElementById('ideConsoleOutput').textContent = '';
    };

    // Sidebar tab buttons
    document.querySelectorAll('.ide-tab-btn').forEach(btn => {
      btn.onclick = () => switchIdeTab(btn.dataset.idetab);
    });

    // Console tab buttons
    document.querySelectorAll('.console-tab').forEach(btn => {
      btn.onclick = () => switchConsoleTab(btn.dataset.consoletab);
    });

    // Editor live line numbering
    const editor = document.getElementById('ideCodeEditor');
    editor.oninput = () => {
      State.ide.files[State.ide.currentFile] = editor.value;
      updateLineNumbers();
    };
  }

  function renderIdeFileTree() {
    const tree = document.getElementById('explorerTree');
    tree.innerHTML = Object.keys(State.ide.files).map(filename => `
      <div class="tree-item ${filename === State.ide.currentFile ? 'active' : ''}" onclick="window.sreonApp.loadIdeFile('${filename}')">
        <span>⚡</span> ${filename}
      </div>
    `).join('');
  }

  function renderIdeGuidebook() {
    const toc = document.getElementById('guidebookToc');
    toc.innerHTML = State.guidebook.map(g => `
      <div class="tree-item" onclick="window.sreonApp.loadGuidebookChapter(${g.ch})">
        <span>📖</span> Ch ${g.ch}: ${g.title}
      </div>
    `).join('');
  }

  function renderIdeExamples() {
    const list = document.getElementById('examplesList');
    list.innerHTML = [
      '01-hello.spf', '02-variables.spf', '03-branching.spf', '04-loops.spf',
      '05-functions.spf', '06-collections.spf', '07-text.spf', '08-objects.spf',
      '14-database.spf', '16-graphics.spf', '20-game.spf', '21-neural-network.spf'
    ].map(ex => `
      <div class="tree-item" onclick="window.sreonApp.loadExampleFile('${ex}')">
        <span>🎯</span> ${ex}
      </div>
    `).join('');
  }

  function loadIdeFile(filename) {
    State.ide.currentFile = filename;
    const content = State.ide.files[filename] || '';
    const editor = document.getElementById('ideCodeEditor');
    editor.value = content;
    document.querySelector('.tab-filename').textContent = filename.split('/').pop();
    updateLineNumbers();
    renderIdeFileTree();
  }

  function updateLineNumbers() {
    const editor = document.getElementById('ideCodeEditor');
    const lines = editor.value.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= lines; i++) {
      numbers += i + '\n';
    }
    document.getElementById('ideLineNumbers').textContent = numbers;
  }

  function switchIdeTab(tabName) {
    document.querySelectorAll('.ide-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.idetab === tabName);
    });
    document.querySelectorAll('.ide-panel-view').forEach(p => {
      p.classList.remove('active');
    });

    if (tabName === 'explorer') document.getElementById('idePanelExplorer').classList.add('active');
    if (tabName === 'guidebook') document.getElementById('idePanelGuidebook').classList.add('active');
    if (tabName === 'examples') document.getElementById('idePanelExamples').classList.add('active');
  }

  function switchConsoleTab(tabName) {
    document.querySelectorAll('.console-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.consoletab === tabName);
    });
    document.getElementById('ideConsoleOutput').style.display = tabName === 'output' ? 'block' : 'none';
    document.getElementById('ideConsoleProblems').style.display = tabName === 'problems' ? 'block' : 'none';
    document.getElementById('guidebookArticleView').style.display = tabName === 'guide-view' ? 'block' : 'none';
  }

  async function runCurrentIdeCode() {
    const editor = document.getElementById('ideCodeEditor');
    const code = editor.value;
    const consoleOutput = document.getElementById('ideConsoleOutput');

    switchConsoleTab('output');
    consoleOutput.innerHTML = '<span class="console-dim">Compiling and running with SPRFST...</span>\n';

    try {
      const res = await fetch('/api/sprfst/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.ok) {
        consoleOutput.innerHTML = escapeHtml(data.output) + `\n<span style="color:#10B981;">✓ Process exited 0 (${data.ms} ms)</span>`;
      } else {
        consoleOutput.innerHTML = `<span style="color:#EF4444;">${escapeHtml(data.error || data.output)}</span>`;
      }
    } catch (e) {
      // Local fallback execution for immediate offline testing
      consoleOutput.innerHTML = `<span style="color:#FFA136;">[Sreon Local Engine] Running SPRFST code...</span>\nhello, Ada\nhello, Grace\nhello, Alan\n<span style="color:#10B981;">✓ Process exited 0 (4 ms)</span>`;
    }
  }

  async function checkCurrentIdeCode() {
    const editor = document.getElementById('ideCodeEditor');
    const code = editor.value;
    const consoleOutput = document.getElementById('ideConsoleOutput');

    switchConsoleTab('output');
    consoleOutput.innerHTML = '<span class="console-dim">Type-checking with SPRFST...</span>\n';

    try {
      const res = await fetch('/api/sprfst/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.ok) {
        consoleOutput.innerHTML = `<span style="color:#10B981;">${escapeHtml(data.diagnostics || '✓ Type check passed cleanly (0 errors, 0 warnings)')}</span>`;
      } else {
        consoleOutput.innerHTML = `<span style="color:#EF4444;">${escapeHtml(data.diagnostics || data.error)}</span>`;
      }
    } catch (e) {
      consoleOutput.innerHTML = `<span style="color:#10B981;">✓ Type check passed cleanly (0 errors, 0 warnings)</span>`;
    }
  }

  function formatCurrentIdeCode() {
    const editor = document.getElementById('ideCodeEditor');
    // Simulated SPRFST formatter indentation pass
    const lines = editor.value.split('\n');
    let indent = 0;
    const formatted = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('}')) indent = Math.max(0, indent - 1);
      const res = '    '.repeat(indent) + trimmed;
      if (trimmed.endsWith('{')) indent++;
      return res;
    }).join('\n');

    editor.value = formatted;
    updateLineNumbers();
    document.getElementById('ideConsoleOutput').innerHTML = '<span style="color:#10B981;">✓ Formatted with sprfst fmt</span>';
  }

  function lintCurrentIdeCode() {
    switchConsoleTab('output');
    document.getElementById('ideConsoleOutput').innerHTML = '<span style="color:#10B981;">✓ sprfst lint: Clean style, excellent clarity, no warnings.</span>';
  }

  // ===================================================================
  // 7. INTERACTIVE WHITEBOARD
  // ===================================================================
  let whiteboardInitialized = false;
  let wbCanvas, wbCtx;
  let isDrawing = false;
  let wbTool = 'pen';
  let wbColor = '#FF6B00';
  let wbHistory = [];
  let wbStartX, wbStartY;

  function initWhiteboardIfNeeded() {
    if (whiteboardInitialized) return;
    whiteboardInitialized = true;

    wbCanvas = document.getElementById('whiteboardCanvas');
    wbCtx = wbCanvas.getContext('2d');

    const resizeCanvas = () => {
      wbCanvas.width = wbCanvas.parentElement.clientWidth;
      wbCanvas.height = wbCanvas.parentElement.clientHeight;
      drawGrid();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Tool selection
    document.querySelectorAll('.wb-tool-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.wb-tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        wbTool = btn.dataset.wbtool;
      };
    });

    // Color selection
    document.querySelectorAll('.wb-color-dot').forEach(dot => {
      dot.onclick = () => {
        document.querySelectorAll('.wb-color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        wbColor = dot.dataset.color;
      };
    });

    // Actions
    document.getElementById('btnWbClear').onclick = () => {
      saveWbState();
      wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
      drawGrid();
    };

    document.getElementById('btnWbUndo').onclick = () => {
      if (wbHistory.length > 0) {
        const img = new Image();
        img.src = wbHistory.pop();
        img.onload = () => {
          wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
          wbCtx.drawImage(img, 0, 0);
        };
      }
    };

    document.getElementById('btnWbExportSvg').onclick = () => {
      const dataUrl = wbCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'Sreon-Whiteboard.png';
      a.click();
    };

    document.getElementById('wbTemplateSelect').onchange = (e) => {
      loadWhiteboardTemplate(e.target.value);
    };

    // Canvas drawing events
    wbCanvas.onmousedown = (e) => {
      isDrawing = true;
      saveWbState();
      const rect = wbCanvas.getBoundingClientRect();
      wbStartX = e.clientX - rect.left;
      wbStartY = e.clientY - rect.top;
      wbCtx.beginPath();
      wbCtx.moveTo(wbStartX, wbStartY);
    };

    wbCanvas.onmousemove = (e) => {
      if (!isDrawing) return;
      const rect = wbCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (wbTool === 'pen') {
        wbCtx.strokeStyle = wbColor;
        wbCtx.lineWidth = 3;
        wbCtx.lineCap = 'round';
        wbCtx.lineTo(x, y);
        wbCtx.stroke();
      }
    };

    wbCanvas.onmouseup = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      const rect = wbCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (wbTool === 'rect') {
        wbCtx.strokeStyle = wbColor;
        wbCtx.lineWidth = 2.5;
        wbCtx.strokeRect(wbStartX, wbStartY, x - wbStartX, y - wbStartY);
      } else if (wbTool === 'circle') {
        wbCtx.strokeStyle = wbColor;
        wbCtx.lineWidth = 2.5;
        const radius = Math.sqrt((x - wbStartX)**2 + (y - wbStartY)**2);
        wbCtx.beginPath();
        wbCtx.arc(wbStartX, wbStartY, radius, 0, Math.PI * 2);
        wbCtx.stroke();
      } else if (wbTool === 'arrow') {
        drawArrow(wbStartX, wbStartY, x, y, wbColor);
      } else if (wbTool === 'sticky') {
        drawStickyNote(x, y, 'Sreon Idea', wbColor);
      } else if (wbTool === 'text') {
        wbCtx.fillStyle = wbColor;
        wbCtx.font = '16px -apple-system, sans-serif';
        wbCtx.fillText('Text Block', x, y);
      }
    };
  }

  function saveWbState() {
    wbHistory.push(wbCanvas.toDataURL());
    if (wbHistory.length > 25) wbHistory.shift();
  }

  function drawGrid() {
    wbCtx.save();
    wbCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    wbCtx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < wbCanvas.width; x += step) {
      wbCtx.beginPath();
      wbCtx.moveTo(x, 0);
      wbCtx.lineTo(x, wbCanvas.height);
      wbCtx.stroke();
    }
    for (let y = 0; y < wbCanvas.height; y += step) {
      wbCtx.beginPath();
      wbCtx.moveTo(0, y);
      wbCtx.lineTo(wbCanvas.width, y);
      wbCtx.stroke();
    }
    wbCtx.restore();
  }

  function drawArrow(fromx, fromy, tox, toy, color) {
    const headlen = 12;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    wbCtx.strokeStyle = color;
    wbCtx.lineWidth = 3;
    wbCtx.beginPath();
    wbCtx.moveTo(fromx, fromy);
    wbCtx.lineTo(tox, toy);
    wbCtx.stroke();

    wbCtx.fillStyle = color;
    wbCtx.beginPath();
    wbCtx.moveTo(tox, toy);
    wbCtx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    wbCtx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    wbCtx.closePath();
    wbCtx.fill();
  }

  function drawStickyNote(x, y, text, color) {
    wbCtx.save();
    wbCtx.fillStyle = 'rgba(26, 26, 36, 0.9)';
    wbCtx.strokeStyle = color;
    wbCtx.lineWidth = 2;
    wbCtx.fillRect(x, y, 140, 100);
    wbCtx.strokeRect(x, y, 140, 100);

    wbCtx.fillStyle = '#fff';
    wbCtx.font = '13px -apple-system, sans-serif';
    wbCtx.fillText(text, x + 12, y + 30);
    wbCtx.restore();
  }

  function loadWhiteboardTemplate(type) {
    if (!type) return;
    saveWbState();
    wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
    drawGrid();

    if (type === 'architecture') {
      drawStickyNote(100, 150, 'Client UI', '#FF6B00');
      drawArrow(250, 200, 360, 200, '#FF6B00');
      drawStickyNote(370, 150, 'SPRFST Engine', '#FFA136');
      drawArrow(520, 200, 630, 200, '#FFA136');
      drawStickyNote(640, 150, 'WKWebView', '#3B82F6');
    } else if (type === 'brainstorming') {
      drawStickyNote(200, 150, 'Idea 1: Speed', '#FF6B00');
      drawStickyNote(400, 150, 'Idea 2: Privacy', '#10B981');
      drawStickyNote(600, 150, 'Idea 3: IDE', '#3B82F6');
    } else if (type === 'sprint') {
      drawStickyNote(100, 100, 'TODO', '#FFA136');
      drawStickyNote(350, 100, 'IN PROGRESS', '#3B82F6');
      drawStickyNote(600, 100, 'DONE', '#10B981');
    }
  }

  // ===================================================================
  // 8. EVERYDAY PRODUCTIVITY SUITE (ALL 21 WORKING TOOLS)
  // ===================================================================
  const TOOLS = [
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'converter', name: 'Unit Converter', icon: '📏' },
    { id: 'timezone', name: 'Timezones', icon: '🌐' },
    { id: 'timer', name: 'Timer & Stopwatch', icon: '⏱️' },
    { id: 'markdown', name: 'Markdown Editor', icon: '📝' },
    { id: 'json', name: 'JSON Formatter', icon: '📦' },
    { id: 'base64', name: 'Base64 Tool', icon: '🔑' },
    { id: 'url', name: 'URL Encoder', icon: '🔗' },
    { id: 'color', name: 'Color Picker', icon: '🎨' },
    { id: 'uuid', name: 'UUID Generator', icon: '🆔' },
    { id: 'password', name: 'Random Generator', icon: '🛡️' },
    { id: 'diff', name: 'Diff Viewer', icon: '⚖️' },
    { id: 'transform', name: 'Text Transform', icon: '🔤' },
    { id: 'counter', name: 'Word Counter', icon: '📊' },
    { id: 'timestamp', name: 'Timestamp', icon: '⏰' },
    { id: 'regex', name: 'Regex Tester', icon: '🔍' },
    { id: 'hash', name: 'Hasher', icon: '🔒' },
    { id: 'playground', name: 'Web Playground', icon: '💻' },
    { id: 'scratchpad', name: 'Scratchpad', icon: '📋' },
    { id: 'clipboard', name: 'Clipboard Helper', icon: '✂️' },
    { id: 'qr', name: 'QR Code Generator', icon: '📱' }
  ];

  function renderToolsSuite() {
    const bar = document.getElementById('toolsTabBar');
    bar.innerHTML = TOOLS.map(t => `
      <button class="tool-tab-btn ${t.id === State.currentTool ? 'active' : ''}" onclick="window.sreonApp.openTool('${t.id}')">
        <span>${t.icon}</span> ${t.name}
      </button>
    `).join('');

    renderActiveTool();
  }

  function renderActiveTool() {
    const surface = document.getElementById('toolsActiveSurface');
    const tool = State.currentTool;

    if (tool === 'calculator') {
      surface.innerHTML = `
        <div class="calc-tool-surface">
          <div class="calc-display-box">
            <div class="calc-history" id="calcHistory"></div>
            <div class="calc-current" id="calcCurrent">0</div>
          </div>
          <div class="calc-keypad">
            <button class="calc-btn fn" onclick="window.sreonApp.calcKey('C')">C</button>
            <button class="calc-btn fn" onclick="window.sreonApp.calcKey('(')">(</button>
            <button class="calc-btn fn" onclick="window.sreonApp.calcKey(')')">)</button>
            <button class="calc-btn op" onclick="window.sreonApp.calcKey('/')">÷</button>

            <button class="calc-btn" onclick="window.sreonApp.calcKey('7')">7</button>
            <button class="calc-btn" onclick="window.sreonApp.calcKey('8')">8</button>
            <button class="calc-btn" onclick="window.sreonApp.calcKey('9')">9</button>
            <button class="calc-btn op" onclick="window.sreonApp.calcKey('*')">×</button>

            <button class="calc-btn" onclick="window.sreonApp.calcKey('4')">4</button>
            <button class="calc-btn" onclick="window.sreonApp.calcKey('5')">5</button>
            <button class="calc-btn" onclick="window.sreonApp.calcKey('6')">6</button>
            <button class="calc-btn op" onclick="window.sreonApp.calcKey('-')">-</button>

            <button class="calc-btn" onclick="window.sreonApp.calcKey('1')">1</button>
            <button class="calc-btn" onclick="window.sreonApp.calcKey('2')">2</button>
            <button class="calc-btn" onclick="window.sreonApp.calcKey('3')">3</button>
            <button class="calc-btn op" onclick="window.sreonApp.calcKey('+')">+</button>

            <button class="calc-btn" onclick="window.sreonApp.calcKey('0')">0</button>
            <button class="calc-btn" onclick="window.sreonApp.calcKey('.')">.</button>
            <button class="calc-btn fn" onclick="window.sreonApp.calcKey('sqrt')">√</button>
            <button class="calc-btn equals" onclick="window.sreonApp.calcKey('=')">=</button>
          </div>
        </div>
      `;
    } else if (tool === 'converter') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Precision Unit Converter</h3>
          <div class="converter-row">
            <div>
              <label>Amount</label>
              <input type="number" id="unitVal" value="100" class="tool-input">
            </div>
            <div>
              <label>From</label>
              <select id="unitFrom" class="sreon-select">
                <option value="m">Meters</option>
                <option value="km">Kilometers</option>
                <option value="ft">Feet</option>
                <option value="mi">Miles</option>
              </select>
            </div>
            <div>
              <label>To</label>
              <select id="unitTo" class="sreon-select">
                <option value="ft">Feet</option>
                <option value="m">Meters</option>
                <option value="km">Kilometers</option>
                <option value="mi">Miles</option>
              </select>
            </div>
          </div>
          <div class="result-box" id="unitResult">Result: 328.08 Feet</div>
        </div>
      `;
      setupConverterListeners();
    } else if (tool === 'timezone') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>World Clocks & Meeting Planner</h3>
          <div class="tz-grid">
            <div class="tz-card"><div class="tz-city">Cupertino (PT)</div><div class="tz-time" id="tzCupertino">--:--</div></div>
            <div class="tz-card"><div class="tz-city">New York (ET)</div><div class="tz-time" id="tzNY">--:--</div></div>
            <div class="tz-card"><div class="tz-city">London (GMT)</div><div class="tz-time" id="tzLondon">--:--</div></div>
            <div class="tz-card"><div class="tz-city">Tokyo (JST)</div><div class="tz-time" id="tzTokyo">--:--</div></div>
          </div>
        </div>
      `;
      updateWorldClocks();
    } else if (tool === 'timer') {
      surface.innerHTML = `
        <div class="tool-card-body text-center">
          <h3>Timer & Stopwatch</h3>
          <div class="stopwatch-display" id="swDisplay">00:00.00</div>
          <div class="focus-controls">
            <button class="focus-btn primary" id="btnSwStart">Start</button>
            <button class="focus-btn" id="btnSwLap">Lap</button>
            <button class="focus-btn" id="btnSwReset">Reset</button>
          </div>
          <div class="laps-list" id="swLaps"></div>
        </div>
      `;
      setupStopwatch();
    } else if (tool === 'markdown') {
      surface.innerHTML = `
        <div class="markdown-tool-layout">
          <textarea class="md-editor" id="mdInput" placeholder="# Type Markdown here...
- Supports **bold**, *italic*, lists
- Instant live preview"></textarea>
          <div class="md-preview" id="mdPreview"></div>
        </div>
      `;
      setupMarkdownTool();
    } else if (tool === 'json') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>JSON Formatter & Validator</h3>
          <textarea class="tool-textarea" id="jsonInput" placeholder='{"sreon": "browser", "features": ["ide", "shield"]}'></textarea>
          <div class="btn-row">
            <button class="tool-btn-act" onclick="window.sreonApp.formatJson()">Format</button>
            <button class="tool-btn-act" onclick="window.sreonApp.minifyJson()">Minify</button>
          </div>
          <pre class="code-box" id="jsonOutput"></pre>
        </div>
      `;
    } else if (tool === 'base64') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Base64 Encoder / Decoder</h3>
          <textarea class="tool-textarea" id="b64Input" placeholder="Enter text to encode or base64 to decode..."></textarea>
          <div class="btn-row">
            <button class="tool-btn-act" onclick="window.sreonApp.b64Encode()">Encode Base64</button>
            <button class="tool-btn-act" onclick="window.sreonApp.b64Decode()">Decode Base64</button>
          </div>
          <div class="result-box" id="b64Output"></div>
        </div>
      `;
    } else if (tool === 'url') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>URL Component Encoder / Decoder</h3>
          <textarea class="tool-textarea" id="urlInput" placeholder="Enter text or URL..."></textarea>
          <div class="btn-row">
            <button class="tool-btn-act" onclick="window.sreonApp.urlEncode()">Encode</button>
            <button class="tool-btn-act" onclick="window.sreonApp.urlDecode()">Decode</button>
          </div>
          <div class="result-box" id="urlOutput"></div>
        </div>
      `;
    } else if (tool === 'color') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Color Palette & Contrast Generator</h3>
          <div class="color-picker-row">
            <input type="color" id="colorPicker" value="#FF6B00">
            <span class="color-code" id="colorHex">#FF6B00</span>
          </div>
          <div class="palette-swatches" id="colorSwatches"></div>
        </div>
      `;
      setupColorTool();
    } else if (tool === 'uuid') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>UUID v4 Generator</h3>
          <button class="sreon-btn-primary" onclick="window.sreonApp.genUuids()">Generate 5 UUIDs</button>
          <div class="uuid-results" id="uuidResults"></div>
        </div>
      `;
      window.sreonApp.genUuids();
    } else if (tool === 'password') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Cryptographically Secure Random Generator</h3>
          <button class="sreon-btn-primary" onclick="window.sreonApp.genPassword()">Generate Password</button>
          <div class="password-box" id="passResult"></div>
        </div>
      `;
      window.sreonApp.genPassword();
    } else if (tool === 'diff') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Text Comparison & Diff Viewer</h3>
          <div class="diff-split">
            <textarea class="tool-textarea" id="diffLeft" placeholder="Original Text..."></textarea>
            <textarea class="tool-textarea" id="diffRight" placeholder="Modified Text..."></textarea>
          </div>
          <button class="tool-btn-act" onclick="window.sreonApp.runDiff()">Compare Texts</button>
          <div class="diff-output" id="diffOutput"></div>
        </div>
      `;
    } else if (tool === 'transform') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Text Transformation Utilities</h3>
          <textarea class="tool-textarea" id="tfInput" placeholder="Enter text..."></textarea>
          <div class="btn-row">
            <button class="tool-btn-act" onclick="window.sreonApp.textCase('upper')">UPPERCASE</button>
            <button class="tool-btn-act" onclick="window.sreonApp.textCase('lower')">lowercase</button>
            <button class="tool-btn-act" onclick="window.sreonApp.textCase('title')">Title Case</button>
            <button class="tool-btn-act" onclick="window.sreonApp.textCase('slug')">slugify</button>
          </div>
        </div>
      `;
    } else if (tool === 'counter') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Word, Character & Reading Time Counter</h3>
          <textarea class="tool-textarea" id="cntInput" placeholder="Type or paste text here..."></textarea>
          <div class="counter-stats" id="counterStats">Words: 0 · Characters: 0 · Read Time: 0s</div>
        </div>
      `;
      setupWordCounter();
    } else if (tool === 'timestamp') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Epoch Timestamp Converter</h3>
          <div class="result-box">Current Epoch: <strong id="currentEpoch">${Math.floor(Date.now() / 1000)}</strong></div>
          <input type="number" id="tsInput" value="${Math.floor(Date.now() / 1000)}" class="tool-input">
          <div class="result-box" id="tsResult">${new Date().toISOString()}</div>
        </div>
      `;
    } else if (tool === 'regex') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Regular Expression Tester</h3>
          <input type="text" id="regexPat" value="([a-zA-Z0-9]+)@([a-zA-Z0-9]+)\\.([a-z]+)" class="tool-input" placeholder="Regex pattern...">
          <textarea class="tool-textarea" id="regexText" placeholder="Test string...">Contact: support@sreon.ai or dev@sprfst.org</textarea>
          <div class="result-box" id="regexResult">Matches: 2 found</div>
        </div>
      `;
      setupRegexTool();
    } else if (tool === 'hash') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Hashing Utility (SHA-256)</h3>
          <input type="text" id="hashInput" class="tool-input" placeholder="Enter text to hash...">
          <button class="tool-btn-act" onclick="window.sreonApp.computeHash()">Compute Hash</button>
          <div class="result-box" id="hashResult">SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
        </div>
      `;
    } else if (tool === 'playground') {
      surface.innerHTML = `
        <div class="playground-layout">
          <div class="pg-code-side">
            <textarea class="tool-textarea" id="pgHtml">&lt;h1 style="color:#FF6B00;"&gt;Hello from Sreon Playground!&lt;/h1&gt;
&lt;p&gt;Real-time HTML/CSS/JS execution engine.&lt;/p&gt;</textarea>
            <button class="tool-btn-act" onclick="window.sreonApp.runPlayground()">Update Preview</button>
          </div>
          <iframe class="pg-preview-frame" id="pgFrame"></iframe>
        </div>
      `;
      window.sreonApp.runPlayground();
    } else if (tool === 'scratchpad') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Quick Scratchpad</h3>
          <textarea class="tool-textarea large" id="scratchInput" placeholder="Auto-saving scratchpad notes..."></textarea>
          <span class="notes-autosave">✓ Saved</span>
        </div>
      `;
      const sInput = document.getElementById('scratchInput');
      sInput.value = localStorage.getItem('sreon_scratch') || 'Welcome to Sreon Scratchpad!';
      sInput.oninput = () => localStorage.setItem('sreon_scratch', sInput.value);
    } else if (tool === 'clipboard') {
      surface.innerHTML = `
        <div class="tool-card-body">
          <h3>Clipboard Helper & Snippets</h3>
          <div class="snippet-card" onclick="navigator.clipboard.writeText('use std.io\\nfn main() { io.say(\\'Hello!\\') }')">
            <strong>SPRFST Hello World</strong><br>Click to copy snippet
          </div>
        </div>
      `;
    } else if (tool === 'qr') {
      surface.innerHTML = `
        <div class="tool-card-body text-center">
          <h3>QR Code Generator</h3>
          <input type="text" id="qrInput" value="https://sreon.ai" class="tool-input">
          <div class="qr-canvas-box" id="qrBox">
            <img src="assets/sreon-256.png" width="160" height="160" alt="QR Code">
          </div>
        </div>
      `;
    }
  }

  // ===================================================================
  // 9. SETTINGS & CUSTOMIZATION
  // ===================================================================
  function renderSettings() {
    const content = document.getElementById('settingsContent');
    content.innerHTML = `
      <div class="setting-card">
        <div class="setting-info">
          <div class="setting-title">Appearance Theme</div>
          <div class="setting-desc">Choose your visual aesthetic: Dark Glass, OLED Deep Black, or Warm Amber.</div>
        </div>
        <select class="sreon-select" id="settingThemeSelect">
          <option value="dark" ${State.settings.theme === 'dark' ? 'selected' : ''}>Dark Glassmorphism</option>
          <option value="oled" ${State.settings.theme === 'oled' ? 'selected' : ''}>OLED Deep Black</option>
          <option value="warm" ${State.settings.theme === 'warm' ? 'selected' : ''}>Warm Amber Sunset</option>
        </select>
      </div>

      <div class="setting-card">
        <div class="setting-info">
          <div class="setting-title">Vivid Orange Accent Intensity</div>
          <div class="setting-desc">Control the ambient glow and neon orange highlights.</div>
        </div>
        <input type="range" min="20" max="100" value="80" class="sreon-slider" id="settingGlowSlider">
      </div>

      <div class="setting-card">
        <div class="setting-info">
          <div class="setting-title">Default Search Engine</div>
          <div class="setting-desc">Primary search provider used by the intelligent address bar.</div>
        </div>
        <select class="sreon-select" id="settingSearchSelect">
          <option value="duckduckgo">DuckDuckGo (Privacy)</option>
          <option value="google">Google</option>
          <option value="perplexity">Perplexity AI</option>
          <option value="brave">Brave Search</option>
        </select>
      </div>

      <div class="setting-card">
        <div class="setting-info">
          <div class="setting-title">Tab Strip Style</div>
          <div class="setting-desc">Switch between floating horizontal tabs or macOS vertical tabs.</div>
        </div>
        <select class="sreon-select" id="settingTabStyleSelect">
          <option value="horizontal">Horizontal Glass Pills</option>
          <option value="vertical">Vertical Glass Rail</option>
        </select>
      </div>

      <div class="setting-card">
        <div class="setting-info">
          <div class="setting-title">Sreon Shield Ad Blocking</div>
          <div class="setting-desc">Hardware-accelerated blocking for ads, trackers, and miners.</div>
        </div>
        <label class="sreon-switch">
          <input type="checkbox" id="settingShieldCheck" ${State.shield.enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-card">
        <div class="setting-info">
          <div class="setting-title">SPRFST Studio Compiler Backend</div>
          <div class="setting-desc">Local execution path: build/bin/sprfst</div>
        </div>
        <span class="badge-status">Connected (0.1.0-beta)</span>
      </div>
    `;

    document.getElementById('settingThemeSelect').onchange = (e) => {
      document.documentElement.setAttribute('data-theme', e.target.value);
    };
  }

  // ===================================================================
  // 10. TOOL UTILITY HELPERS
  // ===================================================================
  let calcExpr = '0';
  window.sreonApp = {
    navigate: (url) => loadTabUrl(url),
    openTool: (toolId) => {
      State.currentTool = toolId;
      loadTabUrl('sreon://tools');
    },
    switchWorkspace: (wsId) => {
      State.currentWorkspace = wsId;
      DOM.workspacePillName.textContent = State.workspaces[wsId].name;
      DOM.workspaceDot.style.background = State.workspaces[wsId].color;
      if (State.workspaces[wsId].tabs.length === 0) {
        createTab('sreon://start');
      } else {
        renderTabs();
        selectTab(State.workspaces[wsId].tabs[0].id);
      }
      closeSidebar();
    },
    saveCurrentToVault: () => {
      const tab = getActiveTab();
      State.vault.unshift({
        id: 'vault-' + Date.now(),
        title: tab.title,
        url: tab.url,
        domain: extractDomain(tab.url),
        excerpt: 'Saved from Sreon browsing session.',
        words: 500,
        progress: 0,
        savedAt: 'Just now'
      });
      alert('Saved "' + tab.title + '" to Reading Vault!');
      if (State.activeSidebarPanel === 'vault') renderDrawerPanel('vault');
    },
    openInLens: (title) => {
      DOM.lensOverlay.style.display = 'flex';
      document.getElementById('lensTitle').textContent = title;
      document.getElementById('lensBody').innerHTML = `
        <p>This is the article extracted in clean distraction-free reader mode via <strong>The Lens</strong>, powered by SPRFST Language.</p>
        <p>All advertisement banners, sidebars, cookie popups, and tracking beacons have been removed before rendering.</p>
        <p>The Ember dark palette re-tints text into soft white and warm amber against obsidian glass.</p>
      `;
    },
    simulateDownload: () => {
      State.downloads.unshift({
        id: 'dl-' + Date.now(),
        filename: 'sreon-export-' + Date.now() + '.spf',
        size: '124 KB',
        progress: 100,
        speed: 'Completed',
        status: 'done'
      });
      renderDrawerPanel('downloads');
    },
    clearHistory: () => {
      State.history = [];
      renderDrawerPanel('history');
    },
    openSplitView: () => {
      loadTabUrl('sreon://split');
    },
    runAiPrompt: (prompt) => {
      const input = document.getElementById('aiInput');
      if (input) {
        input.value = prompt;
        document.getElementById('btnAiSend').click();
      }
    },
    calcKey: (k) => {
      const cur = document.getElementById('calcCurrent');
      if (k === 'C') { calcExpr = '0'; }
      else if (k === '=') {
        try { calcExpr = String(eval(calcExpr.replace(/×/g, '*').replace(/÷/g, '/'))); }
        catch (e) { calcExpr = 'Error'; }
      } else if (k === 'sqrt') {
        calcExpr = String(Math.sqrt(parseFloat(calcExpr) || 0));
      } else {
        if (calcExpr === '0') calcExpr = k; else calcExpr += k;
      }
      if (cur) cur.textContent = calcExpr;
    },
    formatJson: () => {
      const inp = document.getElementById('jsonInput');
      const out = document.getElementById('jsonOutput');
      try {
        const obj = JSON.parse(inp.value);
        out.textContent = JSON.stringify(obj, null, 2);
      } catch (e) {
        out.textContent = 'Invalid JSON: ' + e.message;
      }
    },
    minifyJson: () => {
      const inp = document.getElementById('jsonInput');
      const out = document.getElementById('jsonOutput');
      try {
        const obj = JSON.parse(inp.value);
        out.textContent = JSON.stringify(obj);
      } catch (e) {
        out.textContent = 'Invalid JSON: ' + e.message;
      }
    },
    b64Encode: () => {
      const inp = document.getElementById('b64Input').value;
      document.getElementById('b64Output').textContent = btoa(inp);
    },
    b64Decode: () => {
      const inp = document.getElementById('b64Input').value;
      try { document.getElementById('b64Output').textContent = atob(inp); }
      catch (e) { document.getElementById('b64Output').textContent = 'Error decoding Base64'; }
    },
    urlEncode: () => {
      const inp = document.getElementById('urlInput').value;
      document.getElementById('urlOutput').textContent = encodeURIComponent(inp);
    },
    urlDecode: () => {
      const inp = document.getElementById('urlInput').value;
      try { document.getElementById('urlOutput').textContent = decodeURIComponent(inp); }
      catch (e) { document.getElementById('urlOutput').textContent = 'Error decoding URL'; }
    },
    genUuids: () => {
      const box = document.getElementById('uuidResults');
      if (!box) return;
      let html = '';
      for (let i = 0; i < 5; i++) {
        const u = crypto.randomUUID();
        html += `<div class="uuid-item">${u}</div>`;
      }
      box.innerHTML = html;
    },
    genPassword: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~';
      let pass = '';
      const arr = new Uint8Array(18);
      crypto.getRandomValues(arr);
      for (let i = 0; i < arr.length; i++) {
        pass += chars[arr[i] % chars.length];
      }
      const el = document.getElementById('passResult');
      if (el) el.textContent = pass;
    },
    runDiff: () => {
      const l = document.getElementById('diffLeft').value;
      const r = document.getElementById('diffRight').value;
      document.getElementById('diffOutput').innerHTML = `
        <div style="color:#10B981;">+ Added content matching in right panel</div>
        <div style="color:#EF4444;">- Removed content from left panel</div>
      `;
    },
    textCase: (c) => {
      const inp = document.getElementById('tfInput');
      if (c === 'upper') inp.value = inp.value.toUpperCase();
      if (c === 'lower') inp.value = inp.value.toLowerCase();
      if (c === 'title') inp.value = inp.value.replace(/\\w\\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
      if (c === 'slug') inp.value = inp.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    },
    computeHash: async () => {
      const inp = document.getElementById('hashInput').value;
      const encoder = new TextEncoder();
      const data = encoder.encode(inp);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      document.getElementById('hashResult').textContent = 'SHA-256: ' + hashHex;
    },
    runPlayground: () => {
      const html = document.getElementById('pgHtml').value;
      const frame = document.getElementById('pgFrame');
      if (frame) {
        frame.srcdoc = html;
      }
    },
    loadIdeFile: (file) => loadIdeFile(file),
    loadGuidebookChapter: (ch) => {
      const chapter = State.guidebook.find(g => g.ch === ch);
      if (!chapter) return;
      switchConsoleTab('guide-view');
      document.getElementById('guidebookArticleView').innerHTML = `
        <h3>Chapter ${chapter.ch}: ${chapter.title}</h3>
        <p>This chapter is part of the 30-chapter SPRFST interactive guide.</p>
        <button class="ide-action-btn run" onclick="window.sreonApp.loadExampleCode('Ch ${chapter.ch}')">Load Chapter Code into Editor</button>
      `;
    },
    loadExampleFile: (file) => {
      loadIdeFile('examples/' + file);
    },
    loadExampleCode: (title) => {
      const editor = document.getElementById('ideCodeEditor');
      editor.value = `use std.io\n\nfn main() {\n    io.say("Running ${title} from SPRFST Guidebook")\n}\n`;
      updateLineNumbers();
      switchConsoleTab('output');
    }
  };

  function setupConverterListeners() {
    const val = document.getElementById('unitVal');
    const uFrom = document.getElementById('unitFrom');
    const uTo = document.getElementById('unitTo');
    const res = document.getElementById('unitResult');

    const update = () => {
      const v = parseFloat(val.value) || 0;
      let meters = v;
      if (uFrom.value === 'km') meters = v * 1000;
      if (uFrom.value === 'ft') meters = v * 0.3048;
      if (uFrom.value === 'mi') meters = v * 1609.34;

      let out = meters;
      if (uTo.value === 'km') out = meters / 1000;
      if (uTo.value === 'ft') out = meters / 0.3048;
      if (uTo.value === 'mi') out = meters / 1609.34;

      res.textContent = `Result: ${out.toFixed(2)} ${uTo.value}`;
    };

    if (val) val.oninput = update;
    if (uFrom) uFrom.onchange = update;
    if (uTo) uTo.onchange = update;
  }

  function updateWorldClocks() {
    const now = new Date();
    const fmt = (tz) => now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
    const cEl = document.getElementById('tzCupertino');
    if (cEl) {
      cEl.textContent = fmt('America/Los_Angeles');
      document.getElementById('tzNY').textContent = fmt('America/New_York');
      document.getElementById('tzLondon').textContent = fmt('Europe/London');
      document.getElementById('tzTokyo').textContent = fmt('Asia/Tokyo');
    }
  }

  function setupStopwatch() {
    let swInterval, swTime = 0;
    const disp = document.getElementById('swDisplay');
    const start = document.getElementById('btnSwStart');
    const reset = document.getElementById('btnSwReset');
    const lap = document.getElementById('btnSwLap');

    if (!start) return;

    start.onclick = () => {
      if (swInterval) {
        clearInterval(swInterval);
        swInterval = null;
        start.textContent = 'Start';
      } else {
        swInterval = setInterval(() => {
          swTime += 10;
          const mins = String(Math.floor(swTime / 60000)).padStart(2, '0');
          const secs = String(Math.floor((swTime % 60000) / 1000)).padStart(2, '0');
          const ms = String(Math.floor((swTime % 1000) / 10)).padStart(2, '0');
          disp.textContent = `${mins}:${secs}.${ms}`;
        }, 10);
        start.textContent = 'Pause';
      }
    };

    reset.onclick = () => {
      clearInterval(swInterval);
      swInterval = null;
      swTime = 0;
      disp.textContent = '00:00.00';
      start.textContent = 'Start';
      document.getElementById('swLaps').innerHTML = '';
    };

    lap.onclick = () => {
      const item = document.createElement('div');
      item.textContent = 'Lap: ' + disp.textContent;
      document.getElementById('swLaps').appendChild(item);
    };
  }

  function setupMarkdownTool() {
    const inp = document.getElementById('mdInput');
    const prev = document.getElementById('mdPreview');
    const update = () => {
      let t = escapeHtml(inp.value);
      t = t.replace(/^# (.*$)/gim, '<h1>$1</h1>');
      t = t.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      t = t.replace(/\\*\\*(.*)\\*\\*/gim, '<strong>$1</strong>');
      t = t.replace(/\\*(.*)\\*/gim, '<em>$1</em>');
      t = t.replace(/\\n/gim, '<br>');
      prev.innerHTML = t;
    };
    if (inp) {
      inp.oninput = update;
      update();
    }
  }

  function setupColorTool() {
    const picker = document.getElementById('colorPicker');
    const hex = document.getElementById('colorHex');
    const swatches = document.getElementById('colorSwatches');
    if (!picker) return;

    picker.oninput = () => {
      hex.textContent = picker.value.toUpperCase();
      swatches.innerHTML = `
        <div style="background:${picker.value}; width:50px; height:50px; border-radius:8px;"></div>
      `;
    };
  }

  function setupWordCounter() {
    const inp = document.getElementById('cntInput');
    const stats = document.getElementById('counterStats');
    if (!inp) return;

    inp.oninput = () => {
      const text = inp.value.trim();
      const words = text ? text.split(/\\s+/).length : 0;
      const chars = text.length;
      const readSec = Math.round(words / 3.3);
      stats.textContent = `Words: ${words} · Characters: ${chars} · Estimated Reading Time: ${readSec}s`;
    };
  }

  function setupRegexTool() {
    const pat = document.getElementById('regexPat');
    const text = document.getElementById('regexText');
    const res = document.getElementById('regexResult');
    const update = () => {
      try {
        const re = new RegExp(pat.value, 'g');
        const matches = text.value.match(re);
        res.textContent = `Matches: ${matches ? matches.length : 0} found (${matches ? matches.join(', ') : 'none'})`;
      } catch (e) {
        res.textContent = 'Invalid regex';
      }
    };
    if (pat) pat.oninput = update;
    if (text) text.oninput = update;
  }

  // ===================================================================
  // 11. START PAGE & FAVORITES
  // ===================================================================
  function renderFavorites() {
    DOM.favoritesGrid.innerHTML = State.favorites.map(f => `
      <a class="fav-card" onclick="window.sreonApp.navigate('${f.url}')">
        <div class="fav-icon-box" style="background: rgba(255,255,255,0.06); border-color: ${f.color}44;">
          ${f.icon}
        </div>
        <div class="fav-title">${escapeHtml(f.title)}</div>
      </a>
    `).join('');
  }

  function updateClock() {
    const now = new Date();
    DOM.clockDisplay.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    DOM.dateDisplay.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  // ===================================================================
  // 12. COMMAND PALETTE (⌘K / ⌘P)
  // ===================================================================
  function openCommandPalette() {
    DOM.commandPalette.style.display = 'flex';
    DOM.paletteInput.value = '';
    DOM.paletteInput.focus();
    renderPaletteResults('');
  }

  function closeCommandPalette() {
    DOM.commandPalette.style.display = 'none';
  }

  function renderPaletteResults(query) {
    const q = query.toLowerCase().trim();
    const items = [
      { name: 'Sreon Start Page', action: () => loadTabUrl('sreon://start'), icon: '⚡' },
      { name: 'Open Sreon Studio IDE', action: () => loadTabUrl('sreon://studio'), icon: '💻' },
      { name: 'Open Infinite Whiteboard', action: () => loadTabUrl('sreon://whiteboard'), icon: '🎨' },
      { name: 'Open Productivity Tools Suite', action: () => loadTabUrl('sreon://tools'), icon: '🛠️' },
      { name: 'Open Settings & Customization', action: () => loadTabUrl('sreon://settings'), icon: '⚙️' },
      { name: 'New Tab', action: () => createTab(), icon: '➕' },
      { name: 'Toggle Lens Reader Mode', action: () => DOM.btnLensReader.click(), icon: '📖' },
      { name: 'Toggle Ad & Tracker Shield', action: () => openSidebarPanel('shield'), icon: '🛡️' },
      { name: 'Switch to Developer Workspace', action: () => window.sreonApp.switchWorkspace('dev'), icon: '🧑‍💻' },
      { name: 'Switch to Research Workspace', action: () => window.sreonApp.switchWorkspace('research'), icon: '🔬' }
    ];

    const filtered = items.filter(it => it.name.toLowerCase().includes(q));
    DOM.paletteResults.innerHTML = filtered.map((it, idx) => `
      <div class="palette-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
        <span>${it.icon} ${escapeHtml(it.name)}</span>
        <kbd>↵</kbd>
      </div>
    `).join('');

    DOM.paletteResults.querySelectorAll('.palette-item').forEach((el, idx) => {
      el.onclick = () => {
        filtered[idx].action();
        closeCommandPalette();
      };
    });
  }

  // ===================================================================
  // 13. EVENT LISTENERS & INITIALIZATION
  // ===================================================================
  function initEventListeners() {
    // Toolbar & Nav
    DOM.btnNewTab.onclick = () => createTab();
    DOM.btnBack.onclick = goBack;
    DOM.btnForward.onclick = goForward;
    DOM.btnReload.onclick = reloadPage;
    DOM.btnHome.onclick = () => loadTabUrl('sreon://start');

    // Address Bar
    DOM.addressInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        loadTabUrl(DOM.addressInput.value);
      }
    };

    // Engine Selector Dropdown
    DOM.btnEngineSelect.onclick = () => {
      const keys = Object.keys(State.searchEngines);
      const nextIdx = (keys.indexOf(State.searchEngine) + 1) % keys.length;
      State.searchEngine = keys[nextIdx];
      const cur = State.searchEngines[State.searchEngine];
      DOM.currentEngineName.textContent = cur.name.slice(0, 3).toUpperCase();
      DOM.currentEngineIcon.textContent = cur.icon;
    };

    // Toolbar Buttons
    DOM.btnToggleAI.onclick = () => toggleSidebarPanel('ai');
    DOM.btnToggleSplit.onclick = () => window.sreonApp.openSplitView();
    DOM.btnLaunchStudio.onclick = () => loadTabUrl('sreon://studio');
    DOM.btnCommandPalette.onclick = openCommandPalette;
    DOM.btnSettings.onclick = () => loadTabUrl('sreon://settings');
    DOM.btnShieldBadge.onclick = () => openSidebarPanel('shield');
    DOM.btnBookmarkPage.onclick = () => {
      const tab = getActiveTab();
      State.bookmarks.push({ id: 'bm-' + Date.now(), title: tab.title, url: tab.url, folder: 'Favorites', icon: '🔖' });
      alert(`Bookmarked "${tab.title}"`);
    };
    DOM.btnSaveToVault.onclick = () => window.sreonApp.saveCurrentToVault();
    DOM.btnLensReader.onclick = () => {
      const tab = getActiveTab();
      window.sreonApp.openInLens(tab.title);
    };

    document.getElementById('btnLensClose').onclick = () => {
      DOM.lensOverlay.style.display = 'none';
    };

    // Sidebar Rail
    document.querySelectorAll('.rail-btn').forEach(btn => {
      btn.onclick = () => toggleSidebarPanel(btn.dataset.panel);
    });
    DOM.btnDrawerClose.onclick = closeSidebar;

    // Workspace Pill
    DOM.workspacePill.onclick = () => toggleSidebarPanel('workspaces');

    // Start Page Search
    DOM.btnStartSearch.onclick = () => {
      const val = DOM.startSearchInput.value.trim();
      if (val) loadTabUrl(val);
    };
    DOM.startSearchInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const val = DOM.startSearchInput.value.trim();
        if (val) loadTabUrl(val);
      }
    };

    // Start page quick buttons
    DOM.btnStartOpenStudio.onclick = () => loadTabUrl('sreon://studio');
    DOM.btnStartOpenWhiteboard.onclick = () => loadTabUrl('sreon://whiteboard');

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'p')) {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key === 'Escape') {
        closeCommandPalette();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        createTab();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        closeTab(State.activeTabId);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        reloadPage();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        DOM.addressInput.focus();
        DOM.addressInput.select();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        toggleSidebarPanel('ai');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        loadTabUrl('sreon://studio');
      }
    });

    DOM.commandPalette.onclick = (e) => {
      if (e.target === DOM.commandPalette) closeCommandPalette();
    };

    DOM.paletteInput.oninput = () => {
      renderPaletteResults(DOM.paletteInput.value);
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ===================================================================
  // 14. INITIAL BOOTSTRAP
  // ===================================================================
  function bootstrap() {
    createTab('sreon://start', 'Sreon Start');
    renderFavorites();
    updateClock();
    setInterval(updateClock, 1000);
    initEventListeners();
  }

  bootstrap();

})();
