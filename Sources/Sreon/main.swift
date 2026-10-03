import AppKit
import WebKit

private let appName = "Sreon"
private let startURL = "sreon://start"
private let searchURLPrefix = "https://duckduckgo.com/?q="

extension NSColor {
    static func adaptive(light: NSColor, dark: NSColor) -> NSColor {
        NSColor(name: nil) { appearance in
            let match = appearance.bestMatch(from: [.darkAqua, .aqua])
            return match == .darkAqua ? dark : light
        }
    }

    var cg: CGColor { cgColor }
}

final class RoundedView: NSView {
    var fillColor: NSColor { didSet { needsDisplay = true } }
    var strokeColor: NSColor { didSet { needsDisplay = true } }
    var cornerRadius: CGFloat { didSet { needsDisplay = true } }

    init(fill: NSColor, stroke: NSColor, radius: CGFloat) {
        self.fillColor = fill
        self.strokeColor = stroke
        self.cornerRadius = radius
        super.init(frame: .zero)
        translatesAutoresizingMaskIntoConstraints = false
    }

    required init?(coder: NSCoder) { nil }

    override func draw(_ dirtyRect: NSRect) {
        let rect = bounds.insetBy(dx: 0.5, dy: 0.5)
        let path = NSBezierPath(roundedRect: rect, xRadius: cornerRadius, yRadius: cornerRadius)
        fillColor.setFill()
        path.fill()
        strokeColor.setStroke()
        path.lineWidth = 1
        path.stroke()
    }
}

final class GlyphView: NSView {
    private let text: String
    private let size: CGFloat

    init(text: String, size: CGFloat) {
        self.text = text
        self.size = size
        super.init(frame: .zero)
        translatesAutoresizingMaskIntoConstraints = false
        wantsLayer = true
        layer?.cornerRadius = size * 0.28
        layer?.masksToBounds = true
        NSLayoutConstraint.activate([
            widthAnchor.constraint(equalToConstant: size),
            heightAnchor.constraint(equalToConstant: size)
        ])
    }

    required init?(coder: NSCoder) { nil }

    override func draw(_ dirtyRect: NSRect) {
        let bounds = self.bounds
        let gradient = NSGradient(colors: [
            NSColor(red: 0.94, green: 0.99, blue: 1.0, alpha: 1),
            NSColor(red: 0.43, green: 0.86, blue: 1.0, alpha: 1),
            NSColor(red: 0.30, green: 0.39, blue: 1.0, alpha: 1)
        ])
        let path = NSBezierPath(roundedRect: bounds.insetBy(dx: 0.5, dy: 0.5), xRadius: size * 0.28, yRadius: size * 0.28)
        gradient?.draw(in: path, angle: -35)

        let attrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: size * 0.56, weight: .black),
            .foregroundColor: NSColor(red: 0.03, green: 0.07, blue: 0.12, alpha: 1)
        ]
        let attributed = NSAttributedString(string: text, attributes: attrs)
        let textSize = attributed.size()
        attributed.draw(at: NSPoint(x: (bounds.width - textSize.width) / 2 - size * 0.015,
                                    y: (bounds.height - textSize.height) / 2 + size * 0.03))
    }
}

private func makeLabel(_ text: String, font: NSFont, color: NSColor, alignment: NSTextAlignment = .left) -> NSTextField {
    let label = NSTextField(labelWithString: text)
    label.translatesAutoresizingMaskIntoConstraints = false
    label.font = font
    label.textColor = color
    label.alignment = alignment
    label.lineBreakMode = .byTruncatingTail
    return label
}

private func makeIconButton(symbol: String, fallback: String, tooltip: String, target: AnyObject?, action: Selector?) -> NSButton {
    let button = NSButton(title: fallback, target: target, action: action)
    button.translatesAutoresizingMaskIntoConstraints = false
    button.isBordered = false
    button.bezelStyle = .regularSquare
    button.toolTip = tooltip
    button.wantsLayer = true
    button.layer?.cornerRadius = 17
    button.layer?.backgroundColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.40), dark: NSColor.white.withAlphaComponent(0.08)).cg
    button.contentTintColor = .secondaryLabelColor
    button.setButtonType(.momentaryChange)
    if #available(macOS 11.0, *), let image = NSImage(systemSymbolName: symbol, accessibilityDescription: tooltip) {
        image.isTemplate = true
        button.image = image
        button.imagePosition = .imageOnly
    }
    NSLayoutConstraint.activate([
        button.widthAnchor.constraint(equalToConstant: 34),
        button.heightAnchor.constraint(equalToConstant: 34)
    ])
    return button
}

final class BrowserTab {
    let id = UUID()
    let webView: WKWebView
    var title = "New Tab"
    var url: URL?
    var isStart = true
    var observations: [NSKeyValueObservation] = []

    init(processPool: WKProcessPool) {
        let configuration = WKWebViewConfiguration()
        configuration.processPool = processPool
        configuration.websiteDataStore = .default()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.allowsBackForwardNavigationGestures = true
        webView.allowsMagnification = true
        webView.setValue(false, forKey: "drawsBackground")
    }
}

final class TabPill: NSView {
    private let onSelect: () -> Void
    private let onClose: () -> Void
    private let active: Bool

    init(title: String, active: Bool, onSelect: @escaping () -> Void, onClose: @escaping () -> Void) {
        self.onSelect = onSelect
        self.onClose = onClose
        self.active = active
        super.init(frame: .zero)
        translatesAutoresizingMaskIntoConstraints = false
        wantsLayer = true
        layer?.cornerRadius = 17
        layer?.backgroundColor = active
            ? NSColor.adaptive(light: .white, dark: NSColor.white.withAlphaComponent(0.12)).cg
            : NSColor.clear.cg
        layer?.borderColor = active
            ? NSColor.adaptive(light: NSColor.black.withAlphaComponent(0.10), dark: NSColor.white.withAlphaComponent(0.14)).cg
            : NSColor.clear.cg
        layer?.borderWidth = active ? 1 : 0

        let dot = NSView()
        dot.translatesAutoresizingMaskIntoConstraints = false
        dot.wantsLayer = true
        dot.layer?.cornerRadius = 4
        dot.layer?.backgroundColor = NSColor(red: 0.15, green: 0.39, blue: 0.92, alpha: 1).cg

        let label = makeLabel(title, font: .systemFont(ofSize: 13, weight: .medium), color: active ? .labelColor : .secondaryLabelColor)
        label.lineBreakMode = .byTruncatingTail

        let close = NSButton(title: "×", target: self, action: #selector(closeTapped))
        close.translatesAutoresizingMaskIntoConstraints = false
        close.isBordered = false
        close.font = .systemFont(ofSize: 16, weight: .regular)
        close.contentTintColor = .secondaryLabelColor

        let stack = NSStackView(views: [dot, label, close])
        stack.translatesAutoresizingMaskIntoConstraints = false
        stack.orientation = .horizontal
        stack.alignment = .centerY
        stack.spacing = 7
        addSubview(stack)

        NSLayoutConstraint.activate([
            widthAnchor.constraint(greaterThanOrEqualToConstant: 132),
            widthAnchor.constraint(lessThanOrEqualToConstant: 230),
            heightAnchor.constraint(equalToConstant: 34),
            dot.widthAnchor.constraint(equalToConstant: 8),
            dot.heightAnchor.constraint(equalToConstant: 8),
            close.widthAnchor.constraint(equalToConstant: 18),
            stack.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 11),
            stack.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -8),
            stack.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])

        addGestureRecognizer(NSClickGestureRecognizer(target: self, action: #selector(selectTapped)))
    }

    required init?(coder: NSCoder) { nil }

    @objc private func selectTapped() { onSelect() }
    @objc private func closeTapped() { onClose() }
}

final class StartPageView: NSView, NSTextFieldDelegate {
    let searchField = NSSearchField()
    var onSubmit: ((String) -> Void)?
    var onQuickLink: ((String) -> Void)?

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        translatesAutoresizingMaskIntoConstraints = false
        wantsLayer = true
        setup()
    }

    required init?(coder: NSCoder) { nil }

    override func draw(_ dirtyRect: NSRect) {
        let gradient = NSGradient(colors: [
            NSColor.adaptive(light: NSColor(red: 0.98, green: 0.99, blue: 1.0, alpha: 1), dark: NSColor(red: 0.05, green: 0.07, blue: 0.10, alpha: 1)),
            NSColor.adaptive(light: NSColor(red: 0.94, green: 0.96, blue: 1.0, alpha: 1), dark: NSColor(red: 0.03, green: 0.04, blue: 0.07, alpha: 1))
        ])
        gradient?.draw(in: bounds, angle: -90)

        NSColor(red: 0.0, green: 0.76, blue: 1.0, alpha: 0.18).setFill()
        NSBezierPath(ovalIn: NSRect(x: bounds.minX + 120, y: bounds.maxY - 280, width: 260, height: 260)).fill()
        NSColor(red: 0.29, green: 0.37, blue: 1.0, alpha: 0.13).setFill()
        NSBezierPath(ovalIn: NSRect(x: bounds.maxX - 390, y: bounds.minY + 90, width: 330, height: 330)).fill()
    }

    private func setup() {
        let card = RoundedView(
            fill: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.76), dark: NSColor(red: 0.11, green: 0.14, blue: 0.20, alpha: 0.78)),
            stroke: NSColor.adaptive(light: NSColor.black.withAlphaComponent(0.10), dark: NSColor.white.withAlphaComponent(0.12)),
            radius: 36
        )
        addSubview(card)

        let glyph = GlyphView(text: "S", size: 78)
        let eyebrow = makeLabel("SREON BROWSER", font: .systemFont(ofSize: 12, weight: .bold), color: NSColor.systemBlue, alignment: .center)
        let title = makeLabel("Fast, quiet browsing.", font: .systemFont(ofSize: 58, weight: .bold), color: .labelColor, alignment: .center)
        title.lineBreakMode = .byWordWrapping
        title.maximumNumberOfLines = 2
        let subtitle = makeLabel("A native macOS browser with a minimalist Sreon interface — no AI assistant, no agent panel, no distractions.", font: .systemFont(ofSize: 17, weight: .regular), color: .secondaryLabelColor, alignment: .center)
        subtitle.lineBreakMode = .byWordWrapping
        subtitle.maximumNumberOfLines = 3

        searchField.translatesAutoresizingMaskIntoConstraints = false
        searchField.placeholderString = "Search DuckDuckGo or enter a URL"
        searchField.font = .systemFont(ofSize: 17)
        searchField.isBordered = false
        searchField.focusRingType = .none
        searchField.delegate = self
        searchField.target = self
        searchField.action = #selector(submitSearch)
        searchField.wantsLayer = true
        searchField.layer?.cornerRadius = 28
        searchField.layer?.backgroundColor = NSColor.adaptive(light: .white, dark: NSColor.white.withAlphaComponent(0.10)).cg
        searchField.layer?.borderColor = NSColor.adaptive(light: NSColor.black.withAlphaComponent(0.12), dark: NSColor.white.withAlphaComponent(0.14)).cg
        searchField.layer?.borderWidth = 1

        let quickStack = NSStackView()
        quickStack.translatesAutoresizingMaskIntoConstraints = false
        quickStack.orientation = .horizontal
        quickStack.alignment = .centerY
        quickStack.distribution = .gravityAreas
        quickStack.spacing = 10

        for (title, url) in [
            ("Apple", "https://www.apple.com"),
            ("GitHub", "https://github.com"),
            ("Hacker News", "https://news.ycombinator.com"),
            ("Wikipedia", "https://wikipedia.org")
        ] {
            let button = NSButton(title: title, target: self, action: #selector(quickLinkTapped(_:)))
            button.identifier = NSUserInterfaceItemIdentifier(url)
            button.isBordered = false
            button.wantsLayer = true
            button.layer?.cornerRadius = 16
            button.layer?.backgroundColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.48), dark: NSColor.white.withAlphaComponent(0.08)).cg
            button.contentTintColor = .labelColor
            button.font = .systemFont(ofSize: 13, weight: .medium)
            button.translatesAutoresizingMaskIntoConstraints = false
            button.heightAnchor.constraint(equalToConstant: 32).isActive = true
            quickStack.addArrangedSubview(button)
        }

        let content = NSStackView(views: [glyph, eyebrow, title, subtitle, searchField, quickStack])
        content.translatesAutoresizingMaskIntoConstraints = false
        content.orientation = .vertical
        content.alignment = .centerX
        content.spacing = 14
        content.setCustomSpacing(8, after: eyebrow)
        content.setCustomSpacing(18, after: subtitle)
        card.addSubview(content)

        NSLayoutConstraint.activate([
            card.centerXAnchor.constraint(equalTo: centerXAnchor),
            card.centerYAnchor.constraint(equalTo: centerYAnchor, constant: -18),
            card.widthAnchor.constraint(lessThanOrEqualToConstant: 760),
            card.widthAnchor.constraint(greaterThanOrEqualToConstant: 520),

            content.topAnchor.constraint(equalTo: card.topAnchor, constant: 42),
            content.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -38),
            content.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 48),
            content.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -48),
            searchField.widthAnchor.constraint(equalToConstant: 560),
            searchField.heightAnchor.constraint(equalToConstant: 56),
            subtitle.widthAnchor.constraint(lessThanOrEqualToConstant: 560),
            title.widthAnchor.constraint(lessThanOrEqualToConstant: 650)
        ])
    }

    @objc private func submitSearch() {
        let value = searchField.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        onSubmit?(value)
    }

    @objc private func quickLinkTapped(_ sender: NSButton) {
        guard let raw = sender.identifier?.rawValue else { return }
        onQuickLink?(raw)
    }
}

final class BrowserView: NSView, NSTextFieldDelegate, WKNavigationDelegate, WKUIDelegate {
    private let processPool = WKProcessPool()
    private var tabs: [BrowserTab] = []
    private var activeIndex = 0
    private var keyMonitor: Any?

    private let chrome = NSVisualEffectView()
    private let tabStack = NSStackView()
    private let contentView = NSView()
    private let startPage = StartPageView()
    private let addressField = NSSearchField()
    private lazy var backButton = makeIconButton(symbol: "chevron.left", fallback: "‹", tooltip: "Back", target: self, action: #selector(back))
    private lazy var forwardButton = makeIconButton(symbol: "chevron.right", fallback: "›", tooltip: "Forward", target: self, action: #selector(forward))
    private lazy var reloadButton = makeIconButton(symbol: "arrow.clockwise", fallback: "↻", tooltip: "Reload", target: self, action: #selector(reload))

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        translatesAutoresizingMaskIntoConstraints = false
        setupUI()
        setupCallbacks()
        installKeyboardMonitor()
        newTab(nil)
    }

    required init?(coder: NSCoder) { nil }

    deinit {
        if let keyMonitor { NSEvent.removeMonitor(keyMonitor) }
    }

    private func setupUI() {
        wantsLayer = true
        layer?.backgroundColor = NSColor.windowBackgroundColor.cg

        chrome.translatesAutoresizingMaskIntoConstraints = false
        chrome.material = .underWindowBackground
        chrome.blendingMode = .withinWindow
        chrome.state = .active
        addSubview(chrome)

        contentView.translatesAutoresizingMaskIntoConstraints = false
        contentView.wantsLayer = true
        addSubview(contentView)

        let topRow = NSStackView()
        topRow.translatesAutoresizingMaskIntoConstraints = false
        topRow.orientation = .horizontal
        topRow.alignment = .centerY
        topRow.spacing = 10
        chrome.addSubview(topRow)

        let brand = makeBrand()
        tabStack.translatesAutoresizingMaskIntoConstraints = false
        tabStack.orientation = .horizontal
        tabStack.alignment = .centerY
        tabStack.spacing = 7
        tabStack.setContentHuggingPriority(.defaultLow, for: .horizontal)
        tabStack.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)

        let newButton = makeIconButton(symbol: "plus", fallback: "+", tooltip: "New Tab", target: self, action: #selector(newTabFromButton))
        topRow.addArrangedSubview(brand)
        topRow.addArrangedSubview(tabStack)
        topRow.addArrangedSubview(newButton)

        let toolbar = NSStackView()
        toolbar.translatesAutoresizingMaskIntoConstraints = false
        toolbar.orientation = .horizontal
        toolbar.alignment = .centerY
        toolbar.spacing = 8
        chrome.addSubview(toolbar)

        let navGroup = NSStackView(views: [backButton, forwardButton, reloadButton])
        navGroup.orientation = .horizontal
        navGroup.alignment = .centerY
        navGroup.spacing = 4

        addressField.translatesAutoresizingMaskIntoConstraints = false
        addressField.placeholderString = "Search or enter website"
        addressField.font = .systemFont(ofSize: 14.5)
        addressField.isBordered = false
        addressField.focusRingType = .none
        addressField.delegate = self
        addressField.target = self
        addressField.action = #selector(addressSubmitted)
        addressField.wantsLayer = true
        addressField.layer?.cornerRadius = 22
        addressField.layer?.backgroundColor = NSColor.adaptive(light: .white, dark: NSColor.white.withAlphaComponent(0.10)).cg
        addressField.layer?.borderColor = NSColor.adaptive(light: NSColor.black.withAlphaComponent(0.10), dark: NSColor.white.withAlphaComponent(0.13)).cg
        addressField.layer?.borderWidth = 1

        let menuButton = makeIconButton(symbol: "ellipsis", fallback: "…", tooltip: "About Sreon", target: self, action: #selector(showAbout))
        toolbar.addArrangedSubview(navGroup)
        toolbar.addArrangedSubview(addressField)
        toolbar.addArrangedSubview(menuButton)

        contentView.addSubview(startPage)

        NSLayoutConstraint.activate([
            chrome.topAnchor.constraint(equalTo: topAnchor),
            chrome.leadingAnchor.constraint(equalTo: leadingAnchor),
            chrome.trailingAnchor.constraint(equalTo: trailingAnchor),
            chrome.heightAnchor.constraint(equalToConstant: 116),

            contentView.topAnchor.constraint(equalTo: chrome.bottomAnchor),
            contentView.leadingAnchor.constraint(equalTo: leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: bottomAnchor),

            topRow.topAnchor.constraint(equalTo: chrome.topAnchor, constant: 12),
            topRow.leadingAnchor.constraint(equalTo: chrome.leadingAnchor, constant: 88),
            topRow.trailingAnchor.constraint(equalTo: chrome.trailingAnchor, constant: -14),
            topRow.heightAnchor.constraint(equalToConstant: 38),

            toolbar.topAnchor.constraint(equalTo: topRow.bottomAnchor, constant: 10),
            toolbar.leadingAnchor.constraint(equalTo: chrome.leadingAnchor, constant: 14),
            toolbar.trailingAnchor.constraint(equalTo: chrome.trailingAnchor, constant: -14),
            toolbar.heightAnchor.constraint(equalToConstant: 46),
            addressField.heightAnchor.constraint(equalToConstant: 44),

            startPage.topAnchor.constraint(equalTo: contentView.topAnchor),
            startPage.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            startPage.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            startPage.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])
    }

    private func makeBrand() -> NSView {
        let glyph = GlyphView(text: "S", size: 24)
        let title = makeLabel("Sreon", font: .systemFont(ofSize: 14, weight: .semibold), color: .labelColor)
        let stack = NSStackView(views: [glyph, title])
        stack.translatesAutoresizingMaskIntoConstraints = false
        stack.orientation = .horizontal
        stack.alignment = .centerY
        stack.spacing = 9

        let holder = RoundedView(
            fill: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.42), dark: NSColor.white.withAlphaComponent(0.08)),
            stroke: NSColor.adaptive(light: NSColor.black.withAlphaComponent(0.08), dark: NSColor.white.withAlphaComponent(0.10)),
            radius: 17
        )
        holder.addSubview(stack)
        NSLayoutConstraint.activate([
            holder.heightAnchor.constraint(equalToConstant: 34),
            stack.leadingAnchor.constraint(equalTo: holder.leadingAnchor, constant: 8),
            stack.trailingAnchor.constraint(equalTo: holder.trailingAnchor, constant: -13),
            stack.centerYAnchor.constraint(equalTo: holder.centerYAnchor)
        ])
        return holder
    }

    private func setupCallbacks() {
        startPage.onSubmit = { [weak self] value in self?.navigateActive(value) }
        startPage.onQuickLink = { [weak self] value in self?.navigateActive(value) }
    }

    private func installKeyboardMonitor() {
        keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            guard let self, self.window?.isKeyWindow == true else { return event }
            guard event.modifierFlags.contains(.command), let key = event.charactersIgnoringModifiers?.lowercased() else { return event }

            switch key {
            case "t": self.newTab(nil); return nil
            case "w": self.closeActiveTab(); return nil
            case "l": self.focusAddress(); return nil
            case "r": self.reload(); return nil
            case "[": self.back(); return nil
            case "]": self.forward(); return nil
            default:
                if let number = Int(key), number >= 1, number <= 9 {
                    let index = number == 9 ? self.tabs.count - 1 : number - 1
                    if self.tabs.indices.contains(index) { self.selectTab(index) }
                    return nil
                }
                return event
            }
        }
    }

    @objc func newTabFromButton() { newTab(nil) }
    @objc func newTab(_ sender: Any?) { createTab(load: nil, activate: true) }
    func newTab(with url: URL) { createTab(load: url, activate: true) }

    private func createTab(load url: URL?, activate: Bool) {
        let tab = BrowserTab(processPool: processPool)
        tab.webView.navigationDelegate = self
        tab.webView.uiDelegate = self
        tab.webView.isHidden = true
        contentView.addSubview(tab.webView, positioned: .below, relativeTo: startPage)
        NSLayoutConstraint.activate([
            tab.webView.topAnchor.constraint(equalTo: contentView.topAnchor),
            tab.webView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            tab.webView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            tab.webView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])

        tab.observations = [
            tab.webView.observe(\.title, options: [.new]) { [weak self, weak tab] webView, _ in
                DispatchQueue.main.async {
                    tab?.title = webView.title?.isEmpty == false ? webView.title! : (tab?.url.map { self?.displayURL($0) ?? "Untitled" } ?? "Untitled")
                    self?.renderTabs()
                }
            },
            tab.webView.observe(\.url, options: [.new]) { [weak self, weak tab] webView, _ in
                DispatchQueue.main.async {
                    tab?.url = webView.url
                    self?.updateChrome()
                }
            },
            tab.webView.observe(\.canGoBack, options: [.new]) { [weak self] _, _ in DispatchQueue.main.async { self?.updateChrome() } },
            tab.webView.observe(\.canGoForward, options: [.new]) { [weak self] _, _ in DispatchQueue.main.async { self?.updateChrome() } },
            tab.webView.observe(\.isLoading, options: [.new]) { [weak self] _, _ in DispatchQueue.main.async { self?.renderTabs(); self?.updateChrome() } }
        ]

        tabs.append(tab)
        let index = tabs.count - 1
        if let url {
            tab.isStart = false
            tab.url = url
            tab.title = displayURL(url)
            tab.webView.load(URLRequest(url: url))
        }
        if activate { selectTab(index, focusIfStart: url == nil) }
    }

    @objc func closeActiveTab() {
        guard !tabs.isEmpty else { return }
        let tab = tabs.remove(at: activeIndex)
        tab.webView.removeFromSuperview()
        if tabs.isEmpty {
            activeIndex = 0
            newTab(nil)
        } else {
            activeIndex = min(activeIndex, tabs.count - 1)
            selectTab(activeIndex)
        }
    }

    private func selectTab(_ index: Int, focusIfStart: Bool = false) {
        guard tabs.indices.contains(index) else { return }
        activeIndex = index
        let active = tabs[index]
        for (i, tab) in tabs.enumerated() {
            tab.webView.isHidden = i != index || tab.isStart
        }
        startPage.isHidden = !active.isStart
        renderTabs()
        updateChrome()
        if focusIfStart { DispatchQueue.main.asyncAfter(deadline: .now() + 0.08) { self.focusAddress() } }
    }

    private func renderTabs() {
        for view in tabStack.arrangedSubviews {
            tabStack.removeArrangedSubview(view)
            view.removeFromSuperview()
        }

        for (index, tab) in tabs.enumerated() {
            let title = tab.title.isEmpty ? "New Tab" : tab.title
            let pill = TabPill(title: title, active: index == activeIndex, onSelect: { [weak self] in
                self?.selectTab(index)
            }, onClose: { [weak self] in
                guard let self else { return }
                self.activeIndex = index
                self.closeActiveTab()
            })
            tabStack.addArrangedSubview(pill)
        }
    }

    private func updateChrome() {
        guard tabs.indices.contains(activeIndex) else { return }
        let tab = tabs[activeIndex]
        if window?.firstResponder !== addressField.currentEditor() {
            addressField.stringValue = tab.isStart ? "" : tab.url.map { displayURL($0) } ?? ""
        }
        backButton.isEnabled = tab.webView.canGoBack
        forwardButton.isEnabled = tab.webView.canGoForward
        reloadButton.isEnabled = !tab.isStart
        window?.title = tab.title == "New Tab" ? appName : "\(tab.title) — \(appName)"
    }

    @objc private func addressSubmitted() {
        navigateActive(addressField.stringValue)
    }

    private func navigateActive(_ raw: String) {
        guard tabs.indices.contains(activeIndex), let url = normalizedURL(raw) else { return }
        let tab = tabs[activeIndex]
        tab.isStart = false
        tab.url = url
        tab.title = displayURL(url)
        startPage.isHidden = true
        tab.webView.isHidden = false
        tab.webView.load(URLRequest(url: url))
        updateChrome()
        renderTabs()
    }

    private func normalizedURL(_ input: String) -> URL? {
        let raw = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !raw.isEmpty else { return nil }

        if let schemeRange = raw.range(of: "://"), !schemeRange.isEmpty {
            return URL(string: raw)
        }
        if raw.lowercased().hasPrefix("about:") || raw.lowercased().hasPrefix("data:") {
            return URL(string: raw)
        }
        if looksLikeURL(raw) {
            if raw.lowercased().hasPrefix("localhost") || raw.range(of: #"^\d{1,3}(\.\d{1,3}){3}"#, options: .regularExpression) != nil {
                return URL(string: "http://\(raw)")
            }
            return URL(string: "https://\(raw)")
        }
        return URL(string: searchURLPrefix + raw.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)
    }

    private func looksLikeURL(_ raw: String) -> Bool {
        if raw.contains(" ") { return false }
        if raw.lowercased().hasPrefix("localhost") { return true }
        if raw.range(of: #"^\d{1,3}(\.\d{1,3}){3}"#, options: .regularExpression) != nil { return true }
        return raw.range(of: #"^[^\s]+\.[^\s]{2,}(/.*)?$"#, options: .regularExpression) != nil
    }

    private func displayURL(_ url: URL) -> String {
        if url.absoluteString.hasPrefix(searchURLPrefix), let components = URLComponents(url: url, resolvingAgainstBaseURL: false), let q = components.queryItems?.first(where: { $0.name == "q" })?.value {
            return q
        }
        if let host = url.host {
            let path = url.path == "/" ? "" : url.path
            return host + path + (url.query.map { "?\($0)" } ?? "")
        }
        return url.absoluteString
    }

    @objc func focusAddress() {
        guard tabs.indices.contains(activeIndex) else { return }
        let tab = tabs[activeIndex]
        addressField.stringValue = tab.url?.absoluteString ?? ""
        window?.makeFirstResponder(addressField)
        addressField.currentEditor()?.selectAll(nil)
    }

    @objc func back() {
        guard tabs.indices.contains(activeIndex), tabs[activeIndex].webView.canGoBack else { return }
        tabs[activeIndex].webView.goBack()
    }

    @objc func forward() {
        guard tabs.indices.contains(activeIndex), tabs[activeIndex].webView.canGoForward else { return }
        tabs[activeIndex].webView.goForward()
    }

    @objc func reload() {
        guard tabs.indices.contains(activeIndex), !tabs[activeIndex].isStart else { return }
        tabs[activeIndex].webView.reload()
    }

    @objc func showAbout() {
        let alert = NSAlert()
        alert.messageText = "Sreon Browser"
        alert.informativeText = "A fast native macOS browser with a minimalist Sreon UI. No AI assistant or agent features are included."
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        guard let tab = tabs.first(where: { $0.webView === webView }) else { return }
        tab.isStart = false
        tab.title = "Loading…"
        tab.url = webView.url
        renderTabs()
        updateChrome()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard let tab = tabs.first(where: { $0.webView === webView }) else { return }
        tab.url = webView.url
        tab.title = webView.title?.isEmpty == false ? webView.title! : (webView.url.map { displayURL($0) } ?? "Untitled")
        renderTabs()
        updateChrome()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showLoadError(error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showLoadError(error)
    }

    private func showLoadError(_ error: Error) {
        let nsError = error as NSError
        if nsError.code == NSURLErrorCancelled { return }
        let alert = NSAlert()
        alert.messageText = "Can’t Open Page"
        alert.informativeText = nsError.localizedDescription
        alert.addButton(withTitle: "OK")
        alert.beginSheetModal(for: window ?? NSWindow())
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url, let scheme = url.scheme?.lowercased() else {
            decisionHandler(.allow)
            return
        }
        if ["http", "https", "about", "data", "blob"].contains(scheme) {
            decisionHandler(.allow)
        } else {
            NSWorkspace.shared.open(url)
            decisionHandler(.cancel)
        }
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            newTab(with: url)
        }
        return nil
    }
}

final class BrowserWindowController: NSWindowController {
    let browserView = BrowserView()

    init() {
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1440, height: 920),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.center()
        window.title = appName
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.isMovableByWindowBackground = true
        window.minSize = NSSize(width: 940, height: 640)
        window.contentView = browserView
        super.init(window: window)
    }

    required init?(coder: NSCoder) { nil }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var controller: BrowserWindowController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let controller = BrowserWindowController()
        self.controller = controller
        installMenu(target: controller.browserView)
        controller.showWindow(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }

    private func installMenu(target: BrowserView) {
        let mainMenu = NSMenu()
        NSApp.mainMenu = mainMenu

        let appItem = NSMenuItem()
        mainMenu.addItem(appItem)
        let appMenu = NSMenu(title: appName)
        appItem.submenu = appMenu
        let about = NSMenuItem(title: "About Sreon", action: #selector(BrowserView.showAbout), keyEquivalent: "")
        about.target = target
        appMenu.addItem(about)
        appMenu.addItem(.separator())
        appMenu.addItem(NSMenuItem(title: "Quit Sreon", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))

        let fileItem = NSMenuItem()
        mainMenu.addItem(fileItem)
        let file = NSMenu(title: "File")
        fileItem.submenu = file
        file.addItem(menuItem("New Tab", action: #selector(BrowserView.newTab(_:)), key: "t", target: target))
        file.addItem(menuItem("Close Tab", action: #selector(BrowserView.closeActiveTab), key: "w", target: target))
        file.addItem(.separator())
        file.addItem(menuItem("Open Location", action: #selector(BrowserView.focusAddress), key: "l", target: target))

        let editItem = NSMenuItem()
        mainMenu.addItem(editItem)
        let edit = NSMenu(title: "Edit")
        editItem.submenu = edit
        edit.addItem(NSMenuItem(title: "Undo", action: Selector(("undo:")), keyEquivalent: "z"))
        edit.addItem(NSMenuItem(title: "Redo", action: Selector(("redo:")), keyEquivalent: "Z"))
        edit.addItem(.separator())
        edit.addItem(NSMenuItem(title: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x"))
        edit.addItem(NSMenuItem(title: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c"))
        edit.addItem(NSMenuItem(title: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v"))
        edit.addItem(NSMenuItem(title: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a"))

        let viewItem = NSMenuItem()
        mainMenu.addItem(viewItem)
        let view = NSMenu(title: "View")
        viewItem.submenu = view
        view.addItem(menuItem("Reload", action: #selector(BrowserView.reload), key: "r", target: target))
        view.addItem(.separator())
        view.addItem(NSMenuItem(title: "Enter Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f"))

        let navItem = NSMenuItem()
        mainMenu.addItem(navItem)
        let nav = NSMenu(title: "Navigate")
        navItem.submenu = nav
        nav.addItem(menuItem("Back", action: #selector(BrowserView.back), key: "[", target: target))
        nav.addItem(menuItem("Forward", action: #selector(BrowserView.forward), key: "]", target: target))

        let windowItem = NSMenuItem()
        mainMenu.addItem(windowItem)
        let windowMenu = NSMenu(title: "Window")
        windowItem.submenu = windowMenu
        windowMenu.addItem(NSMenuItem(title: "Minimize", action: #selector(NSWindow.miniaturize(_:)), keyEquivalent: "m"))
    }

    private func menuItem(_ title: String, action: Selector, key: String, target: AnyObject) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: action, keyEquivalent: key)
        item.target = target
        item.keyEquivalentModifierMask = .command
        return item
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
