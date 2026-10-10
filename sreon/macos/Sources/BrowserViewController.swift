// =====================================================================
//  Sreon — WebKit Engine & Browser Controller
//  Powered by SPRFST Language
//  Executes modern HTML5, CSS3, JavaScript, media, forms, cookies,
//  and hardware-accelerated Sreon Shield ad blocking via WKContentRuleList.
// =====================================================================
import AppKit
import WebKit

final class BrowserViewController: NSViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    var webView: WKWebView!
    private var contentRuleList: WKContentRuleList?

    override func loadView() {
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        config.allowsAirPlayForMediaPlayback = true

        let userContent = WKUserContentController()
        userContent.add(self, name: "sreonBridge")
        config.userContentController = userContent

        // Setup custom scheme handler for sreon://
        let schemeHandler = SreonSchemeHandler()
        config.setURLSchemeHandler(schemeHandler, forURLScheme: "sreon")

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.setValue(false, forKey: "drawsBackground") // Transparent background for glassmorphism
        
        self.view = webView
        setupSreonShield()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadUrl("sreon://start")
    }

    func loadUrl(_ address: String) {
        if address.starts_with("sreon://") {
            if let u = URL(string: address) {
                webView.load(URLRequest(url: u))
            }
        } else {
            var target = address
            if !target.contains("://") { target = "https://" + target }
            if let u = URL(string: target) {
                webView.load(URLRequest(url: u))
            }
        }
    }

    // ------------------------------------------------------------- Sreon Shield
    private func setupSreonShield() {
        // Compile Sreon Shield rules into native WebKit hardware content rules
        let rulesJSON = """
        [
            {
                "trigger": { "url-filter": ".*(doubleclick|google-analytics|adnxs|hotjar|outbrain|taboola).*" },
                "action": { "type": "block" }
            },
            {
                "trigger": { "url-filter": ".*" },
                "action": { "type": "css-display-none", "selector": ".cookie-banner, .gdpr-consent, .ad-banner" }
            }
        ]
        """

        WKContentRuleListStore.default().compileContentRuleList(forIdentifier: "SreonShieldRules", encodedContentRuleList: rulesJSON) { [weak self] ruleList, error in
            guard let self = self, let ruleList = ruleList else { return }
            self.contentRuleList = ruleList
            self.webView.configuration.userContentController.add(ruleList)
            print("[SreonShield] Hardware WebKit content filter rules active.")
        }
    }

    // ------------------------------------------------------------- WKNavigationDelegate
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        NotificationCenter.default.post(name: NSNotification.Name("SreonNavigationStarted"), object: webView.url)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        NotificationCenter.default.post(name: NSNotification.Name("SreonNavigationFinished"), object: webView.url)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        NotificationCenter.default.post(name: NSNotification.Name("SreonNavigationFailed"), object: error)
    }

    // ------------------------------------------------------------- Script Message Bridge
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "sreonBridge", let body = message.body as? [String: Any] else { return }
        SreonEngineBridge.shared.sendCommand(body) { resp in
            // Return answer to webView
        }
    }
}

// ------------------------------------------------------------- Custom Scheme Handler
final class SreonSchemeHandler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else { return }
        let host = url.host ?? "start"
        
        let bundle = Bundle.main
        var uiPath = bundle.bundlePath + "/Contents/Resources/ui/index.html"
        if !FileManager.default.fileExists(atPath: uiPath) {
            uiPath = "./sreon/ui/index.html"
        }

        if let htmlData = try? Data(contentsOf: URL(fileURLWithPath: uiPath)) {
            let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: [
                "Content-Type": "text/html; charset=utf-8"
            ])!
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(htmlData)
            urlSchemeTask.didFinish()
        } else {
            let response = HTTPURLResponse(url: url, statusCode: 404, httpVersion: "HTTP/1.1", headerFields: nil)!
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didFinish()
        }
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Cancel task if needed
    }
}

private extension String {
    func starts_with(_ prefix: String) -> Bool {
        return self.hasPrefix(prefix)
    }
}
