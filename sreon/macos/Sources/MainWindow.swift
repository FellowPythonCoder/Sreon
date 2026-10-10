// =====================================================================
//  Sreon — Main Window & Dark Glass Shell
//  Powered by SPRFST Language
// =====================================================================
import AppKit

final class MainWindow: NSWindowController, NSWindowDelegate {
    private var browserVC: BrowserViewController!
    private var visualEffectView: NSVisualEffectView!

    convenience init() {
        let win = NSWindow(
            contentRect: NSRect(x: 100, y: 100, width: 1280, height: 820),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        self.init(window: win)
    }

    override func windowDidLoad() {
        super.windowDidLoad()
        guard let win = window else { return }

        win.title = "Sreon"
        win.titleVisibility = .hidden
        win.titlebarAppearsTransparent = true
        win.backgroundColor = SreonTheme.ink
        win.isOpaque = false
        win.minSize = NSSize(width: 900, height: 600)
        win.delegate = self

        // Layered Frosted Glass Effect
        visualEffectView = NSVisualEffectView(frame: win.contentView?.bounds ?? .zero)
        visualEffectView.autoresizingMask = [.width, .height]
        visualEffectView.material = .underWindowBackground
        visualEffectView.blendingMode = .behindWindow
        visualEffectView.state = .active

        browserVC = BrowserViewController()
        browserVC.view.frame = visualEffectView.bounds
        browserVC.view.autoresizingMask = [.width, .height]

        visualEffectView.addSubview(browserVC.view)
        win.contentView = visualEffectView
    }

    func windowWillClose(_ notification: Notification) {
        NSApplication.shared.terminate(self)
    }
}
