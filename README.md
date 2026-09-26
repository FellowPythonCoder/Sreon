# Sreon Browser

Sreon is a from-scratch, sidebar-first browser shell with a calm purple, cream, and glass visual system. The interface is built as a clean Vite app and can be packaged as an Electron desktop app for macOS, Windows, and Linux.

## Run the interface

```bash
npm install
npm run dev
```

For a production bundle:

```bash
npm run build
npm run preview
```

## Desktop packaging

The Electron entry point is `electron/main.cjs`. After building the web app, use the following on the target platform:

```bash
npm run dist
```

Electron Builder is configured for:

- macOS: DMG
- Windows: NSIS installer and portable executable
- Linux: AppImage, deb, and rpm

The logo family lives in `public/brand/`, with SVG source artwork plus platform icon exports. A signed, notarized, publishable release still requires platform-specific certificates and signing credentials.

## Product notes

- Sidebar modes: expanded, compact, floating, pinned-style default, and auto-hide.
- Search uses the live Wikipedia OpenSearch endpoint with a full-web DuckDuckGo fallback.
- External destinations open in their original website; pages that permit embedding are shown in the browser view.
- Tabs can be created, closed, pinned, duplicated, reordered by drag and drop, and muted-state represented.
- Appearance, privacy, keyboard, workspace, history, bookmark, and download surfaces are functional local UI.
