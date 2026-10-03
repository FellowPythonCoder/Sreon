// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Sreon",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "Sreon", targets: ["Sreon"])
    ],
    targets: [
        .executableTarget(
            name: "Sreon",
            path: "Sources/Sreon"
        )
    ]
)
