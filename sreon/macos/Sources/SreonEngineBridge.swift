// =====================================================================
//  Sreon Engine Bridge
//  Powered by SPRFST Language
//  Communicates with the SPRFST language runtime over JSON lines.
// =====================================================================
import Foundation

final class SreonEngineBridge {
    static let shared = SreonEngineBridge()

    private var process: Process?
    private var inPipe: Pipe?
    private var outPipe: Pipe?
    private var isAlive = false
    private let queue = DispatchQueue(label: "ai.sreon.engine.io")

    init() {
        startEngine()
    }

    func startEngine() {
        let bundle = Bundle.main
        var binPath = bundle.bundlePath + "/Contents/Resources/bin/sprfst"
        var servicePath = bundle.bundlePath + "/Contents/Resources/engine/service.spf"

        if !FileManager.default.fileExists(atPath: binPath) {
            // Local dev fallback
            binPath = "./build/bin/sprfst"
            servicePath = "./sreon/engine/service.spf"
        }

        guard FileManager.default.fileExists(atPath: binPath) else {
            print("[SreonEngineBridge] sprfst compiler binary not found at \(binPath)")
            return
        }

        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: binPath)
        proc.arguments = ["run", servicePath]

        var env = ProcessInfo.processInfo.environment
        env["SREON_ENGINE_HOME"] = bundle.bundlePath + "/Contents/Resources/engine"
        proc.environment = env

        let pin = Pipe()
        let pout = Pipe()
        proc.standardInput = pin
        proc.standardOutput = pout

        do {
            try proc.run()
            self.process = proc
            self.inPipe = pin
            self.outPipe = pout
            self.isAlive = true
            print("[SreonEngineBridge] SPRFST Sreon Engine started PID \(proc.processIdentifier)")
        } catch {
            print("[SreonEngineBridge] Failed to launch SPRFST engine: \(error)")
        }
    }

    func sendCommand(_ cmd: [String: Any], completion: @escaping ([String: Any]?) -> Void) {
        guard isAlive, let pin = inPipe, let pout = outPipe else {
            completion(nil)
            return
        }

        queue.async {
            guard let jsonData = try? JSONSerialization.data(withJSONObject: cmd),
                  let line = String(data: jsonData, encoding: .utf8) else {
                DispatchQueue.main.async { completion(nil) }
                return
            }

            let msg = line + "\n"
            if let d = msg.data(using: .utf8) {
                pin.fileHandleForWriting.write(d)
            }

            // Read line response
            let handle = pout.fileHandleForReading
            let data = handle.availableData
            if let respStr = String(data: data, encoding: .utf8),
               let firstLine = respStr.components(separatedBy: "\n").first,
               let respData = firstLine.data(using: .utf8),
               let json = try? JSONSerialization.jsonObject(with: respData) as? [String: Any] {
                DispatchQueue.main.async { completion(json) }
            } else {
                DispatchQueue.main.async { completion(nil) }
            }
        }
    }

    deinit {
        process?.terminate()
    }
}
