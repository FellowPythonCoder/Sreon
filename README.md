# Sreon Browser

Sreon is a minimalist, macOS-first browser built natively with **Swift + AppKit + WKWebView**. It is inspired by polished Apple-style browser chrome and compact modern browser UIs, but it is Sreon-branded and intentionally includes **no AI assistant, no agent panel, and no AI features**.

## Highlights

- Native Swift/AppKit desktop app for macOS.
- WebKit/WKWebView page engine for fast, system-integrated browsing.
- Minimal tab strip, omnibox, back/forward/reload controls, and start page.
- Apple-like visual design: translucent title area, rounded surfaces, SF Symbols, and system typography.
- Keyboard shortcuts: `⌘T`, `⌘W`, `⌘L`, `⌘R`, `⌘[` and `⌘]`.
- Ships as a macOS `.dmg` with an ad-hoc signed `.app` bundle.

## Download the DMG

The GitHub Actions workflow writes the built installer to:

```text
artifacts/Sreon-1.0.0-mac-universal.dmg
```

That file is generated on a macOS runner because Linux cannot run Apple's `hdiutil` or compile AppKit/WebKit apps.

## Build on macOS

```bash
./scripts/package-macos.sh universal
```

The build script:

1. Compiles the native Swift app in release mode.
2. Wraps the binary into `dist/Sreon.app`.
3. Adds the Sreon app icon and Info.plist metadata.
4. Ad-hoc signs the app bundle.
5. Creates `artifacts/Sreon-1.0.0-mac-universal.dmg`.
6. Writes `artifacts/SHA256SUMS.txt`.

## Project layout

```text
Package.swift                  Swift package definition
Sources/Sreon/main.swift        Native browser UI and WKWebView tab engine
build/icon.icns                 macOS app/DMG icon
scripts/package-macos.sh        macOS packaging script
.github/workflows/build-macos.yml  macOS DMG build workflow
```

## Gatekeeper note

The generated app is ad-hoc signed, not notarized with an Apple Developer ID. On a Mac, you may need to right-click **Sreon.app** and choose **Open** the first time, or sign/notarize it with your own Developer ID for distribution.
