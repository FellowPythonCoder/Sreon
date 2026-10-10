// =====================================================================
//  Sreon — Application Delegate & Menu System
//  Powered by SPRFST Language
// =====================================================================
import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var mainWindow: MainWindow?

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMainMenu()
        mainWindow = MainWindow()
        mainWindow?.windowDidLoad()
        mainWindow?.showWindow(self)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    func application(_ application: NSApplication, open urls: [URL]) {
        if let first = urls.first {
            // Forward to browser
            print("[Sreon] Opening URL: \(first)")
        }
    }

    // ------------------------------------------------------------- Menus
    private func setupMainMenu() {
        let menuBar = NSMenu()

        // Sreon App Menu
        let appMenu = NSMenu(title: "Sreon")
        appMenu.addItem(withTitle: "About Sreon", action: #selector(showAbout), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Preferences...", action: #selector(showPreferences), keyEquivalent: ",")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Hide Sreon", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(withTitle: "Hide Others", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h")
        appMenu.addItem(withTitle: "Show All", action: #selector(NSApplication.unhideAllApplications(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Sreon", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        let appItem = NSMenuItem()
        appItem.submenu = appMenu
        menuBar.addItem(appItem)

        // File Menu
        let fileMenu = NSMenu(title: "File")
        fileMenu.addItem(withTitle: "New Tab", action: #selector(newTabAction), keyEquivalent: "t")
        fileMenu.addItem(withTitle: "New Window", action: #selector(newWindowAction), keyEquivalent: "n")
        fileMenu.addItem(withTitle: "Open Location...", action: #selector(openLocationAction), keyEquivalent: "l")
        fileMenu.addItem(NSMenuItem.separator())
        fileMenu.addItem(withTitle: "Close Tab", action: #selector(closeTabAction), keyEquivalent: "w")
        let fileItem = NSMenuItem()
        fileItem.submenu = fileMenu
        menuBar.addItem(fileItem)

        // Develop Menu
        let devMenu = NSMenu(title: "Develop")
        devMenu.addItem(withTitle: "Sreon Studio IDE", action: #selector(openStudioAction), keyEquivalent: "o")
        devMenu.addItem(withTitle: "Toggle Developer Tools", action: #selector(toggleDevToolsAction), keyEquivalent: "i")
        let devItem = NSMenuItem()
        devItem.submenu = devMenu
        menuBar.addItem(devItem)

        NSApp.mainMenu = menuBar
    }

    @objc func showAbout() {
        let alert = NSAlert()
        alert.messageText = "Sreon"
        alert.informativeText = "The Next Generation of Browsing\nPowered by SPRFST Language\n\nVersion 1.0.0 (Ember)"
        alert.alertStyle = .informational
        alert.runModal()
    }

    @objc func showPreferences() {}
    @objc func newTabAction() {}
    @objc func newWindowAction() {}
    @objc func openLocationAction() {}
    @objc func closeTabAction() {}
    @objc func openStudioAction() {}
    @objc func toggleDevToolsAction() {}
}
