// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Slate",
    platforms: [.macOS(.v14)],
    products: [.executable(name: "Slate", targets: ["Slate"])],
    targets: [
        .executableTarget(name: "Slate", path: "Sources/Slate", resources: [.process("Resources")]),
        .testTarget(name: "SlateTests", dependencies: ["Slate"], path: "Tests/SlateTests")
    ]
)
