# Sreon Browser

Sreon is a minimalist, macOS-first desktop browser built for this repository. It is inspired by modern Apple-style chrome and compact browser UIs, but it is Sreon-branded and intentionally **has no AI assistant, no agent panel, and no AI features**.

## Highlights

- Native-feeling macOS window with inset traffic lights, blur, rounded surfaces, and Apple-system typography.
- Clean tab strip, omnibox, back/forward/reload controls, and quick start page.
- Chromium-based browsing through Electron for broad web compatibility and hardware acceleration.
- Privacy-first permission prompts for camera, microphone, location, notifications, and related site capabilities.
- Downloads save to the macOS Downloads folder.
- Keyboard shortcuts: `⌘T`, `⌘W`, `⌘L`, `⌘R`, `⌘⇧R`, `⌘[` and `⌘]`.

## Run locally

```bash
npm install
npm start
```

## Build a macOS DMG

Apple Silicon DMG:

```bash
npm run build:mac
```

Intel DMG:

```bash
npm run build:mac:x64
```

Universal DMG, if your builder supports it:

```bash
npm run build:mac:universal
```

Build artifacts are written to `release/`. The packaged app is unsigned by default (`identity: null`) so macOS Gatekeeper may require right-clicking the app and choosing **Open** unless you sign/notarize it with an Apple Developer ID.

## Project layout

```text
src/main.js          Electron main process, menus, permissions, downloads
src/preload.js       Safe bridge between the UI and Electron APIs
src/renderer/        Browser chrome UI and tab/webview logic
build/icon.icns      macOS app/DMG icon
scripts/create-icons.js
```

## Notes

This app uses Electron because it can produce a macOS `.dmg` from this Linux-based Arena environment while shipping a fast native Chromium engine. The app UI is intentionally lightweight JavaScript/CSS; actual page rendering runs in Chromium.
