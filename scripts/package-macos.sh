#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="Sreon"
VERSION="1.0.0"
ARCH="${1:-arm64}"
DIST="$ROOT/dist"
APP="$DIST/$APP_NAME.app"
DMG_ROOT="$DIST/dmg-root"
ARTIFACTS="$ROOT/artifacts"

rm -rf "$DIST"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" "$ARTIFACTS"

build_for_arch() {
  local build_arch="$1"
  swift build -c release --arch "$build_arch"
  swift build -c release --arch "$build_arch" --show-bin-path
}

if [[ "$ARCH" == "universal" ]]; then
  ARM_BIN_DIR="$(build_for_arch arm64 | tail -n 1)"
  X64_BIN_DIR="$(build_for_arch x86_64 | tail -n 1)"
  lipo -create \
    "$ARM_BIN_DIR/$APP_NAME" \
    "$X64_BIN_DIR/$APP_NAME" \
    -output "$APP/Contents/MacOS/$APP_NAME"
else
  BIN_DIR="$(build_for_arch "$ARCH" | tail -n 1)"
  cp "$BIN_DIR/$APP_NAME" "$APP/Contents/MacOS/$APP_NAME"
fi
chmod +x "$APP/Contents/MacOS/$APP_NAME"
cp "$ROOT/build/icon.icns" "$APP/Contents/Resources/Sreon.icns"

cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>Sreon</string>
  <key>CFBundleExecutable</key>
  <string>Sreon</string>
  <key>CFBundleIconFile</key>
  <string>Sreon</string>
  <key>CFBundleIdentifier</key>
  <string>app.sreon.browser</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>Sreon</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>$VERSION</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSApplicationCategoryType</key>
  <string>public.app-category.productivity</string>
  <key>LSMinimumSystemVersion</key>
  <string>13.0</string>
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoadsInWebContent</key>
    <true/>
  </dict>
  <key>NSCameraUsageDescription</key>
  <string>Sreon asks before allowing a website to use your camera.</string>
  <key>NSMicrophoneUsageDescription</key>
  <string>Sreon asks before allowing a website to use your microphone.</string>
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>Sreon asks before allowing a website to use your location.</string>
  <key>NSHighResolutionCapable</key>
  <true/>
  <key>NSSupportsAutomaticGraphicsSwitching</key>
  <true/>
</dict>
</plist>
PLIST

codesign --force --deep --sign - "$APP"

rm -rf "$DMG_ROOT"
mkdir -p "$DMG_ROOT"
cp -R "$APP" "$DMG_ROOT/"
ln -s /Applications "$DMG_ROOT/Applications"

DMG="$ARTIFACTS/Sreon-$VERSION-mac-$ARCH.dmg"
rm -f "$DMG"
hdiutil create -volname "Sreon" -srcfolder "$DMG_ROOT" -ov -format UDZO "$DMG"
shasum -a 256 "$DMG" > "$ARTIFACTS/SHA256SUMS.txt"
ls -lh "$DMG" "$ARTIFACTS/SHA256SUMS.txt"
