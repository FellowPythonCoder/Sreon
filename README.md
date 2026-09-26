# Sreon Browser

Sreon is a from-scratch native desktop browser shell written in Rust. It does not start a localhost server, ship a web dashboard, or require Electron. The UI is drawn directly with `egui`/`eframe`, the release profile uses LTO and a single codegen unit, and web pages render inside the same Sreon window through a native WebView child.

## Requirements

- Rust stable toolchain (`rustup` recommended)
- Linux: `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libxcb`, `libxkbcommon`, and a working X11 or Wayland session
- macOS 11 or newer for the Apple build (WebKit is built in)
- Windows 10 or newer with the WebView2 runtime

## Run the native app

```bash
cargo run --manifest-path native/Cargo.toml
```

For an optimized local run:

```bash
cargo run --release --manifest-path native/Cargo.toml
```

The app is fully native and does not use `localhost`.

## Build

```bash
cargo build --release --manifest-path native/Cargo.toml
```

The optimized binary is written to:

```text
native/target/release/sreon
```

## Packaging

The crate contains bundle metadata and platform packaging metadata in `native/Cargo.toml`.

### macOS app and DMG

Run these commands on macOS:

```bash
cargo install cargo-bundle
cd native
cargo bundle --release
cd ..
hdiutil create -volname Sreon -srcfolder native/target/release/bundle/osx/Sreon.app -ov -format UDZO Sreon.dmg
```

### Windows executable

Run on Windows:

```powershell
cargo build --release --manifest-path native/Cargo.toml
```

The executable is:

```text
native\target\release\sreon.exe
```

Use an installer tool such as WiX or NSIS for `Sreon-Setup.exe`.

### Linux packages

Sreon uses the native WebKitGTK WebView on Linux. The same-window child WebView is supported on X11. On Wayland, run the app under XWayland until the GTK-container backend is added.

Install dependencies on Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y build-essential libgtk-3-dev libwebkit2gtk-4.1-dev libxcb-render0-dev libxcb-shape0-dev libxcb-xfixes0-dev libxkbcommon-dev
```

Build the binary and packages:

```bash
cargo install cargo-deb cargo-rpm
bash native/packaging/build-linux.sh
```

Outputs:

```text
native/target/release/sreon
release/Sreon.deb
release/Sreon.AppImage
native/target/release/rpmbuild/RPMS/**/*.rpm
```

For a no-terminal launch, use:

```text
release/Sreon.AppImage
```

Make it executable once in the file manager: right-click → Properties → Permissions → Allow executing as a program. After that, double-click `Sreon.AppImage` to launch Sreon. The `.deb` can also be double-clicked to install through the desktop software manager.

The GitHub Actions workflow also builds the Linux binary, AppImage, `.deb`, and `.rpm` on an Ubuntu runner. macOS and Windows installers must be built on their target operating systems for proper signing, native toolchains, and notarization.

## Interaction model

- Search and address submissions open in Sreon's embedded native WebView in the same window.
- Search uses Bing's live web index for results across the open internet, with the Bing-facing chrome rebranded as Sreon Search.
- Links clicked inside the page continue navigating inside Sreon.
- Tabs support new, close, pin, mute, duplicate-style workflow, and compact management.
- Sidebar modes include Expanded, Compact, Floating, Auto-hide, and Pinned.
- Privacy, Settings, Bookmarks, History, Downloads, and open tabs are kept as focused native surfaces instead of oversized dashboard panels.
- The Sreon mark is rendered as a symbol-only vector mark in the app chrome. SVG brand sources live in `public/brand/`.
