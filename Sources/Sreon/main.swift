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

    init(title: String, active: Bool, onSelect: @escaping () -> Void, onClose: @escaping () -> Void) {
        self.onSelect = onSelect
        self.onClose = onClose
        super.init(frame: .zero)
        translatesAutoresizingMaskIntoConstraints = false
        wantsLayer = true
        layer?.cornerRadius = 18
        layer?.masksToBounds = false
        layer?.backgroundColor = active
            ? NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.66), dark: NSColor.white.withAlphaComponent(0.16)).cg
            : NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.18), dark: NSColor.white.withAlphaComponent(0.055)).cg
        layer?.borderColor = active
            ? NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.88), dark: NSColor.white.withAlphaComponent(0.24)).cg
            : NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.30), dark: NSColor.white.withAlphaComponent(0.08)).cg
        layer?.borderWidth = 1
        if active {
            layer?.shadowColor = NSColor.systemBlue.withAlphaComponent(0.28).cg
            layer?.shadowOpacity = 0.32
            layer?.shadowRadius = 16
            layer?.shadowOffset = NSSize(width: 0, height: 8)
        }

        let initial = title.trimmingCharacters(in: .whitespacesAndNewlines).first.map { String($0).uppercased() } ?? "S"
        let orb = RoundedView(
            fill: active
                ? NSColor(red: 0.72, green: 0.90, blue: 1.0, alpha: 0.95)
                : NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.62), dark: NSColor.white.withAlphaComponent(0.12)),
            stroke: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.76), dark: NSColor.white.withAlphaComponent(0.18)),
            radius: 12
        )
        let initialLabel = makeLabel(initial, font: .systemFont(ofSize: 12, weight: .bold), color: active ? .black : .labelColor, alignment: .center)
        orb.addSubview(initialLabel)

        let label = makeLabel(title, font: .systemFont(ofSize: 13.5, weight: active ? .semibold : .medium), color: active ? .labelColor : .secondaryLabelColor)
        label.lineBreakMode = .byTruncatingTail

        let close = NSButton(title: "×", target: self, action: #selector(closeTapped))
        close.translatesAutoresizingMaskIntoConstraints = false
        close.isBordered = false
        close.font = .systemFont(ofSize: 17, weight: .regular)
        close.contentTintColor = .secondaryLabelColor
        close.toolTip = "Close tab"

        let stack = NSStackView(views: [orb, label, close])
        stack.translatesAutoresizingMaskIntoConstraints = false
        stack.orientation = .horizontal
        stack.alignment = .centerY
        stack.spacing = 9
        addSubview(stack)

        NSLayoutConstraint.activate([
            heightAnchor.constraint(equalToConstant: 48),
            widthAnchor.constraint(equalToConstant: 216),
            orb.widthAnchor.constraint(equalToConstant: 26),
            orb.heightAnchor.constraint(equalToConstant: 26),
            close.widthAnchor.constraint(equalToConstant: 18),
            initialLabel.centerXAnchor.constraint(equalTo: orb.centerXAnchor),
            initialLabel.centerYAnchor.constraint(equalTo: orb.centerYAnchor),
            stack.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 12),
            stack.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -10),
            stack.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])

        addGestureRecognizer(NSClickGestureRecognizer(target: self, action: #selector(selectTapped)))
    }

    required init?(coder: NSCoder) { nil }

    @objc private func selectTapped() { onSelect() }
    @objc private func closeTapped() { onClose() }
}

final class StartPageView: NSView, NSSearchFieldDelegate {
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
            NSColor.adaptive(light: NSColor(red: 0.88, green: 0.93, blue: 1.0, alpha: 1), dark: NSColor(red: 0.035, green: 0.047, blue: 0.075, alpha: 1)),
            NSColor.adaptive(light: NSColor(red: 0.97, green: 0.88, blue: 0.98, alpha: 1), dark: NSColor(red: 0.08, green: 0.05, blue: 0.13, alpha: 1)),
            NSColor.adaptive(light: NSColor(red: 0.78, green: 0.88, blue: 1.0, alpha: 1), dark: NSColor(red: 0.03, green: 0.10, blue: 0.18, alpha: 1))
        ])
        gradient?.draw(in: bounds, angle: -28)

        func blob(_ rect: NSRect, _ color: NSColor) {
            color.setFill()
            NSBezierPath(ovalIn: rect).fill()
        }
        blob(NSRect(x: bounds.minX + bounds.width * 0.06, y: bounds.maxY - 330, width: 360, height: 360), NSColor(red: 0.0, green: 0.80, blue: 1.0, alpha: 0.20))
        blob(NSRect(x: bounds.midX - 150, y: bounds.midY - 80, width: 430, height: 430), NSColor(red: 1.0, green: 0.25, blue: 0.78, alpha: 0.16))
        blob(NSRect(x: bounds.maxX - 460, y: bounds.minY + 70, width: 420, height: 420), NSColor(red: 0.25, green: 0.34, blue: 1.0, alpha: 0.20))
        blob(NSRect(x: bounds.maxX - 670, y: bounds.maxY - 260, width: 260, height: 260), NSColor(red: 1.0, green: 0.65, blue: 0.18, alpha: 0.14))
    }

    private func makeDot(_ color: NSColor) -> NSView {
        let dot = NSView()
        dot.translatesAutoresizingMaskIntoConstraints = false
        dot.wantsLayer = true
        dot.layer?.cornerRadius = 5
        dot.layer?.backgroundColor = color.cg
        NSLayoutConstraint.activate([
            dot.widthAnchor.constraint(equalToConstant: 10),
            dot.heightAnchor.constraint(equalToConstant: 10)
        ])
        return dot
    }

    private func makeQuickButton(_ title: String, url: String) -> NSButton {
        let button = NSButton(title: title, target: self, action: #selector(quickLinkTapped(_:)))
        button.identifier = NSUserInterfaceItemIdentifier(url)
        button.isBordered = false
        button.wantsLayer = true
        button.layer?.cornerRadius = 18
        button.layer?.backgroundColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.38), dark: NSColor.white.withAlphaComponent(0.10)).cg
        button.layer?.borderColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.70), dark: NSColor.white.withAlphaComponent(0.16)).cg
        button.layer?.borderWidth = 1
        button.contentTintColor = .labelColor
        button.font = .systemFont(ofSize: 13, weight: .semibold)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.heightAnchor.constraint(equalToConstant: 36).isActive = true
        button.widthAnchor.constraint(greaterThanOrEqualToConstant: 92).isActive = true
        return button
    }

    private func makeInfoCard(number: String, title: String, detail: String) -> NSView {
        let card = RoundedView(
            fill: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.36), dark: NSColor.white.withAlphaComponent(0.085)),
            stroke: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.62), dark: NSColor.white.withAlphaComponent(0.13)),
            radius: 22
        )
        let n = makeLabel(number, font: .systemFont(ofSize: 11, weight: .heavy), color: NSColor.systemBlue)
        let t = makeLabel(title, font: .systemFont(ofSize: 14, weight: .bold), color: .labelColor)
        let d = makeLabel(detail, font: .systemFont(ofSize: 12.5, weight: .regular), color: .secondaryLabelColor)
        d.lineBreakMode = .byWordWrapping
        d.maximumNumberOfLines = 2
        let stack = NSStackView(views: [n, t, d])
        stack.translatesAutoresizingMaskIntoConstraints = false
        stack.orientation = .vertical
        stack.alignment = .leading
        stack.spacing = 5
        card.addSubview(stack)
        NSLayoutConstraint.activate([
            card.widthAnchor.constraint(equalToConstant: 190),
            card.heightAnchor.constraint(equalToConstant: 116),
            stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 18),
            stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -16),
            stack.centerYAnchor.constraint(equalTo: card.centerYAnchor)
        ])
        return card
    }

    private func setup() {
        let hero = RoundedView(
            fill: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.28), dark: NSColor(red: 0.08, green: 0.10, blue: 0.16, alpha: 0.42)),
            stroke: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.70), dark: NSColor.white.withAlphaComponent(0.13)),
            radius: 38
        )
        hero.wantsLayer = true
        hero.layer?.shadowColor = NSColor.black.withAlphaComponent(0.18).cg
        hero.layer?.shadowOpacity = 0.28
        hero.layer?.shadowRadius = 30
        hero.layer?.shadowOffset = NSSize(width: 0, height: 20)
        addSubview(hero)

        let dots = NSStackView(views: [
            makeDot(NSColor(red: 1.0, green: 0.37, blue: 0.34, alpha: 1)),
            makeDot(NSColor(red: 1.0, green: 0.76, blue: 0.18, alpha: 1)),
            makeDot(NSColor(red: 0.22, green: 0.79, blue: 0.30, alpha: 1))
        ])
        dots.translatesAutoresizingMaskIntoConstraints = false
        dots.orientation = .horizontal
        dots.spacing = 10
        hero.addSubview(dots)

        let glyph = GlyphView(text: "S", size: 64)
        let eyebrow = makeLabel("SREON", font: .systemFont(ofSize: 12, weight: .heavy), color: NSColor.systemBlue, alignment: .center)
        let title = makeLabel("Browse in glass.", font: .systemFont(ofSize: 62, weight: .bold), color: .labelColor, alignment: .center)
        title.maximumNumberOfLines = 2
        title.lineBreakMode = .byWordWrapping
        let subtitle = makeLabel("A calm Zen-style sidebar browser for macOS. Minimal chrome, WebKit speed, and zero AI inside.", font: .systemFont(ofSize: 17, weight: .regular), color: .secondaryLabelColor, alignment: .center)
        subtitle.maximumNumberOfLines = 2
        subtitle.lineBreakMode = .byWordWrapping

        searchField.translatesAutoresizingMaskIntoConstraints = false
        searchField.placeholderString = "Search DuckDuckGo or enter a URL"
        searchField.font = .systemFont(ofSize: 18, weight: .medium)
        searchField.isBordered = false
        searchField.focusRingType = .none
        searchField.delegate = self
        searchField.target = self
        searchField.action = #selector(submitSearch)
        searchField.wantsLayer = true
        searchField.layer?.cornerRadius = 31
        searchField.layer?.backgroundColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.64), dark: NSColor.white.withAlphaComponent(0.14)).cg
        searchField.layer?.borderColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.88), dark: NSColor.white.withAlphaComponent(0.20)).cg
        searchField.layer?.borderWidth = 1
        searchField.layer?.shadowColor = NSColor.systemBlue.withAlphaComponent(0.22).cg
        searchField.layer?.shadowOpacity = 0.45
        searchField.layer?.shadowRadius = 18
        searchField.layer?.shadowOffset = NSSize(width: 0, height: 10)

        let quickStack = NSStackView(views: [
            makeQuickButton("Apple", url: "https://www.apple.com"),
            makeQuickButton("GitHub", url: "https://github.com"),
            makeQuickButton("News", url: "https://news.ycombinator.com"),
            makeQuickButton("Wiki", url: "https://wikipedia.org")
        ])
        quickStack.translatesAutoresizingMaskIntoConstraints = false
        quickStack.orientation = .horizontal
        quickStack.alignment = .centerY
        quickStack.spacing = 10

        let content = NSStackView(views: [glyph, eyebrow, title, subtitle, searchField, quickStack])
        content.translatesAutoresizingMaskIntoConstraints = false
        content.orientation = .vertical
        content.alignment = .centerX
        content.spacing = 13
        content.setCustomSpacing(7, after: eyebrow)
        content.setCustomSpacing(24, after: subtitle)
        hero.addSubview(content)

        let leftCard = makeInfoCard(number: "01", title: "Sidebar tabs", detail: "Zen-like tabs live on the left, not in a top bar.")
        let rightCard = makeInfoCard(number: "02", title: "No AI", detail: "No assistant panel, no model calls, no automation layer.")
        let bottomCard = makeInfoCard(number: "03", title: "Native WebKit", detail: "Swift, AppKit, and WKWebView for a Mac-first build.")
        addSubview(leftCard)
        addSubview(rightCard)
        addSubview(bottomCard)

        NSLayoutConstraint.activate([
            hero.centerXAnchor.constraint(equalTo: centerXAnchor),
            hero.centerYAnchor.constraint(equalTo: centerYAnchor, constant: -16),
            hero.widthAnchor.constraint(lessThanOrEqualToConstant: 860),
            hero.widthAnchor.constraint(greaterThanOrEqualToConstant: 620),
            hero.heightAnchor.constraint(equalToConstant: 430),

            dots.leadingAnchor.constraint(equalTo: hero.leadingAnchor, constant: 24),
            dots.topAnchor.constraint(equalTo: hero.topAnchor, constant: 20),

            content.centerXAnchor.constraint(equalTo: hero.centerXAnchor),
            content.centerYAnchor.constraint(equalTo: hero.centerYAnchor, constant: 16),
            content.leadingAnchor.constraint(greaterThanOrEqualTo: hero.leadingAnchor, constant: 48),
            content.trailingAnchor.constraint(lessThanOrEqualTo: hero.trailingAnchor, constant: -48),
            title.widthAnchor.constraint(lessThanOrEqualToConstant: 700),
            subtitle.widthAnchor.constraint(lessThanOrEqualToConstant: 610),
            searchField.widthAnchor.constraint(equalToConstant: 610),
            searchField.heightAnchor.constraint(equalToConstant: 62),

            leftCard.trailingAnchor.constraint(equalTo: hero.leadingAnchor, constant: 70),
            leftCard.centerYAnchor.constraint(equalTo: hero.centerYAnchor, constant: -36),
            rightCard.leadingAnchor.constraint(equalTo: hero.trailingAnchor, constant: -70),
            rightCard.centerYAnchor.constraint(equalTo: hero.centerYAnchor, constant: 42),
            bottomCard.centerXAnchor.constraint(equalTo: hero.centerXAnchor),
            bottomCard.topAnchor.constraint(equalTo: hero.bottomAnchor, constant: -28)
        ])
    }

    func focusSearch() {
        window?.makeFirstResponder(searchField)
        searchField.currentEditor()?.selectAll(nil)
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

final class BrowserView: NSView, NSSearchFieldDelegate, WKNavigationDelegate, WKUIDelegate {
    private let processPool = WKProcessPool()
    private var tabs: [BrowserTab] = []
    private var activeIndex = 0
    private var keyMonitor: Any?

    private let chrome = NSVisualEffectView()
    private let tabStack = NSStackView()
    private let contentView = NSView()
    private let startPage = StartPageView()
    private let addressPalette = NSVisualEffectView()
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
        layer?.backgroundColor = NSColor.adaptive(light: NSColor(red: 0.78, green: 0.86, blue: 0.96, alpha: 1), dark: NSColor(red: 0.02, green: 0.03, blue: 0.06, alpha: 1)).cg

        contentView.translatesAutoresizingMaskIntoConstraints = false
        contentView.wantsLayer = true
        contentView.layer?.cornerRadius = 34
        contentView.layer?.masksToBounds = true
        contentView.layer?.backgroundColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.55), dark: NSColor(red: 0.04, green: 0.05, blue: 0.08, alpha: 1)).cg
        addSubview(contentView)

        chrome.translatesAutoresizingMaskIntoConstraints = false
        chrome.material = .hudWindow
        chrome.blendingMode = .withinWindow
        chrome.state = .active
        chrome.wantsLayer = true
        chrome.layer?.cornerRadius = 30
        chrome.layer?.masksToBounds = true
        chrome.layer?.borderColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.62), dark: NSColor.white.withAlphaComponent(0.13)).cg
        chrome.layer?.borderWidth = 1
        chrome.layer?.shadowColor = NSColor.black.withAlphaComponent(0.20).cg
        chrome.layer?.shadowOpacity = 0.24
        chrome.layer?.shadowRadius = 24
        chrome.layer?.shadowOffset = NSSize(width: 0, height: 16)
        addSubview(chrome)

        setupSidebar()
        setupAddressPalette()

        contentView.addSubview(startPage)

        NSLayoutConstraint.activate([
            chrome.topAnchor.constraint(equalTo: topAnchor, constant: 14),
            chrome.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 14),
            chrome.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -14),
            chrome.widthAnchor.constraint(equalToConstant: 248),

            contentView.topAnchor.constraint(equalTo: topAnchor, constant: 14),
            contentView.leadingAnchor.constraint(equalTo: chrome.trailingAnchor, constant: 14),
            contentView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -14),
            contentView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -14),

            startPage.topAnchor.constraint(equalTo: contentView.topAnchor),
            startPage.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            startPage.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            startPage.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])
    }

    private func setupSidebar() {
        let stack = NSStackView()
        stack.translatesAutoresizingMaskIntoConstraints = false
        stack.orientation = .vertical
        stack.alignment = .centerX
        stack.spacing = 12
        chrome.addSubview(stack)

        let brand = makeSidebarBrand()
        let searchButton = makeIconButton(symbol: "magnifyingglass", fallback: "⌘L", tooltip: "Search or enter address", target: self, action: #selector(focusAddress))
        let plusButton = makeIconButton(symbol: "plus", fallback: "+", tooltip: "New Tab", target: self, action: #selector(newTabFromButton))
        let homeButton = makeIconButton(symbol: "house", fallback: "⌂", tooltip: "Start Page", target: self, action: #selector(goHome))
        let aboutButton = makeIconButton(symbol: "info.circle", fallback: "i", tooltip: "About Sreon", target: self, action: #selector(showAbout))

        let navRow = NSStackView(views: [backButton, forwardButton, reloadButton])
        navRow.translatesAutoresizingMaskIntoConstraints = false
        navRow.orientation = .horizontal
        navRow.alignment = .centerY
        navRow.spacing = 6

        let actionRow = NSStackView(views: [searchButton, plusButton, homeButton])
        actionRow.translatesAutoresizingMaskIntoConstraints = false
        actionRow.orientation = .horizontal
        actionRow.alignment = .centerY
        actionRow.spacing = 6

        let tabsLabel = makeLabel("TABS", font: .systemFont(ofSize: 11, weight: .heavy), color: .secondaryLabelColor)
        tabsLabel.alignment = .left
        let tabsLabelWrap = NSView()
        tabsLabelWrap.translatesAutoresizingMaskIntoConstraints = false
        tabsLabelWrap.addSubview(tabsLabel)
        NSLayoutConstraint.activate([
            tabsLabelWrap.widthAnchor.constraint(equalToConstant: 216),
            tabsLabel.leadingAnchor.constraint(equalTo: tabsLabelWrap.leadingAnchor, constant: 2),
            tabsLabel.centerYAnchor.constraint(equalTo: tabsLabelWrap.centerYAnchor),
            tabsLabelWrap.heightAnchor.constraint(equalToConstant: 20)
        ])

        tabStack.translatesAutoresizingMaskIntoConstraints = false
        tabStack.orientation = .vertical
        tabStack.alignment = .centerX
        tabStack.spacing = 8

        let tabScroll = NSScrollView()
        tabScroll.translatesAutoresizingMaskIntoConstraints = false
        tabScroll.drawsBackground = false
        tabScroll.hasVerticalScroller = false
        tabScroll.hasHorizontalScroller = false
        tabScroll.borderType = .noBorder
        tabScroll.documentView = tabStack
        tabScroll.setContentHuggingPriority(.defaultLow, for: .vertical)
        tabScroll.setContentCompressionResistancePriority(.defaultLow, for: .vertical)

        let footer = RoundedView(
            fill: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.25), dark: NSColor.white.withAlphaComponent(0.07)),
            stroke: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.48), dark: NSColor.white.withAlphaComponent(0.10)),
            radius: 18
        )
        let footerText = makeLabel("No AI • Native Mac", font: .systemFont(ofSize: 12, weight: .semibold), color: .secondaryLabelColor, alignment: .center)
        footer.addSubview(footerText)
        NSLayoutConstraint.activate([
            footer.widthAnchor.constraint(equalToConstant: 216),
            footer.heightAnchor.constraint(equalToConstant: 40),
            footerText.centerXAnchor.constraint(equalTo: footer.centerXAnchor),
            footerText.centerYAnchor.constraint(equalTo: footer.centerYAnchor)
        ])

        stack.addArrangedSubview(brand)
        stack.addArrangedSubview(actionRow)
        stack.addArrangedSubview(navRow)
        stack.setCustomSpacing(20, after: navRow)
        stack.addArrangedSubview(tabsLabelWrap)
        stack.addArrangedSubview(tabScroll)
        stack.addArrangedSubview(footer)
        stack.addArrangedSubview(aboutButton)

        NSLayoutConstraint.activate([
            stack.topAnchor.constraint(equalTo: chrome.topAnchor, constant: 54),
            stack.leadingAnchor.constraint(equalTo: chrome.leadingAnchor, constant: 16),
            stack.trailingAnchor.constraint(equalTo: chrome.trailingAnchor, constant: -16),
            stack.bottomAnchor.constraint(equalTo: chrome.bottomAnchor, constant: -16),

            brand.widthAnchor.constraint(equalToConstant: 216),
            brand.heightAnchor.constraint(equalToConstant: 56),
            tabScroll.widthAnchor.constraint(equalToConstant: 216),
            tabStack.widthAnchor.constraint(equalTo: tabScroll.contentView.widthAnchor),
            tabStack.topAnchor.constraint(equalTo: tabScroll.contentView.topAnchor),
            tabStack.leadingAnchor.constraint(equalTo: tabScroll.contentView.leadingAnchor),
            tabStack.trailingAnchor.constraint(equalTo: tabScroll.contentView.trailingAnchor)
        ])
    }

    private func setupAddressPalette() {
        addressPalette.translatesAutoresizingMaskIntoConstraints = false
        addressPalette.material = .popover
        addressPalette.blendingMode = .withinWindow
        addressPalette.state = .active
        addressPalette.wantsLayer = true
        addressPalette.layer?.cornerRadius = 32
        addressPalette.layer?.masksToBounds = true
        addressPalette.layer?.borderColor = NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.78), dark: NSColor.white.withAlphaComponent(0.18)).cg
        addressPalette.layer?.borderWidth = 1
        addressPalette.layer?.shadowColor = NSColor.black.withAlphaComponent(0.22).cg
        addressPalette.layer?.shadowOpacity = 0.28
        addressPalette.layer?.shadowRadius = 28
        addressPalette.layer?.shadowOffset = NSSize(width: 0, height: 18)
        addressPalette.isHidden = true
        addSubview(addressPalette)

        addressField.translatesAutoresizingMaskIntoConstraints = false
        addressField.placeholderString = "Search or enter website"
        addressField.font = .systemFont(ofSize: 18, weight: .medium)
        addressField.isBordered = false
        addressField.focusRingType = .none
        addressField.delegate = self
        addressField.target = self
        addressField.action = #selector(addressSubmitted)
        addressField.wantsLayer = true
        addressField.layer?.cornerRadius = 24
        addressField.layer?.backgroundColor = NSColor.clear.cg
        addressPalette.addSubview(addressField)

        NSLayoutConstraint.activate([
            addressPalette.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            addressPalette.topAnchor.constraint(equalTo: topAnchor, constant: 58),
            addressPalette.heightAnchor.constraint(equalToConstant: 66),
            addressPalette.widthAnchor.constraint(lessThanOrEqualToConstant: 760),
            addressPalette.widthAnchor.constraint(greaterThanOrEqualToConstant: 520),
            addressPalette.widthAnchor.constraint(lessThanOrEqualTo: contentView.widthAnchor, multiplier: 0.84),

            addressField.leadingAnchor.constraint(equalTo: addressPalette.leadingAnchor, constant: 18),
            addressField.trailingAnchor.constraint(equalTo: addressPalette.trailingAnchor, constant: -18),
            addressField.centerYAnchor.constraint(equalTo: addressPalette.centerYAnchor),
            addressField.heightAnchor.constraint(equalToConstant: 50)
        ])
    }

    private func makeSidebarBrand() -> NSView {
        let holder = RoundedView(
            fill: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.30), dark: NSColor.white.withAlphaComponent(0.08)),
            stroke: NSColor.adaptive(light: NSColor.white.withAlphaComponent(0.54), dark: NSColor.white.withAlphaComponent(0.12)),
            radius: 22
        )
        let glyph = GlyphView(text: "S", size: 34)
        let title = makeLabel("Sreon", font: .systemFont(ofSize: 17, weight: .bold), color: .labelColor)
        let subtitle = makeLabel("zen sidebar", font: .systemFont(ofSize: 11, weight: .medium), color: .secondaryLabelColor)
        let labels = NSStackView(views: [title, subtitle])
        labels.translatesAutoresizingMaskIntoConstraints = false
        labels.orientation = .vertical
        labels.alignment = .leading
        labels.spacing = 0
        let row = NSStackView(views: [glyph, labels])
        row.translatesAutoresizingMaskIntoConstraints = false
        row.orientation = .horizontal
        row.alignment = .centerY
        row.spacing = 10
        holder.addSubview(row)
        NSLayoutConstraint.activate([
            row.leadingAnchor.constraint(equalTo: holder.leadingAnchor, constant: 12),
            row.trailingAnchor.constraint(lessThanOrEqualTo: holder.trailingAnchor, constant: -12),
            row.centerYAnchor.constraint(equalTo: holder.centerYAnchor)
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
            if event.keyCode == 53, !self.addressPalette.isHidden {
                self.hideAddressPalette()
                return nil
            }
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
        hideAddressPalette()
        renderTabs()
        updateChrome()
        if focusIfStart {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.10) {
                if active.isStart { self.startPage.focusSearch() } else { self.focusAddress() }
            }
        }
    }

    private func renderTabs() {
        for view in tabStack.arrangedSubviews {
            tabStack.removeArrangedSubview(view)
            view.removeFromSuperview()
        }

        for tab in tabs {
            let title = tab.title.isEmpty ? "New Tab" : tab.title
            let pill = TabPill(title: title, active: tab === tabs[activeIndex], onSelect: { [weak self, weak tab] in
                guard let self, let tab, let index = self.tabs.firstIndex(where: { $0.id == tab.id }) else { return }
                self.selectTab(index)
            }, onClose: { [weak self, weak tab] in
                guard let self, let tab, let index = self.tabs.firstIndex(where: { $0.id == tab.id }) else { return }
                self.activeIndex = index
                self.closeActiveTab()
            })
            tabStack.addArrangedSubview(pill)
        }
    }

    private func updateChrome() {
        guard tabs.indices.contains(activeIndex) else { return }
        let tab = tabs[activeIndex]
        if !addressPalette.isHidden, window?.firstResponder !== addressField.currentEditor() {
            addressField.stringValue = tab.isStart ? "" : tab.url.map { $0.absoluteString } ?? ""
        }
        backButton.isEnabled = tab.webView.canGoBack
        forwardButton.isEnabled = tab.webView.canGoForward
        reloadButton.isEnabled = !tab.isStart
        window?.title = tab.title == "New Tab" ? appName : "\(tab.title) — \(appName)"
    }

    @objc private func addressSubmitted() {
        navigateActive(addressField.stringValue)
        hideAddressPalette()
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
        startPage.searchField.stringValue = ""
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

    private func hideAddressPalette() {
        addressPalette.isHidden = true
        if window?.firstResponder === addressField.currentEditor() {
            window?.makeFirstResponder(nil)
        }
    }

    @objc func focusAddress() {
        guard tabs.indices.contains(activeIndex) else { return }
        let tab = tabs[activeIndex]
        addressField.stringValue = tab.url?.absoluteString ?? ""
        addressPalette.isHidden = false
        window?.makeFirstResponder(addressField)
        addressField.currentEditor()?.selectAll(nil)
    }

    @objc func goHome() {
        guard tabs.indices.contains(activeIndex) else { return }
        let tab = tabs[activeIndex]
        tab.webView.stopLoading()
        tab.isStart = true
        tab.url = nil
        tab.title = "New Tab"
        startPage.searchField.stringValue = ""
        selectTab(activeIndex, focusIfStart: true)
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
        alert.informativeText = "A native macOS browser with a Zen-style glass sidebar, WebKit browsing, and no AI assistant or model features."
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
