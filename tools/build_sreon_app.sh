#!/usr/bin/env bash
# =====================================================================
#  Builds "Sreon.app" for macOS (Apple Silicon & Intel).
#
#      ./tools/build_sreon_app.sh            full build
#      ./tools/build_sreon_app.sh --install  build, install to /Applications, open it
#      ./tools/build_sreon_app.sh --stage    stage the application bundle
#      ./tools/build_sreon_app.sh --skip-tests
# =====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APP_NAME="Sreon"
BUNDLE_ID="ai.sreon.browser"
EXECUTABLE="Sreon"
VERSION="1.0.0"
ARCH="${SPRFST_ARCH:-arm64}"
STAGE_ONLY=0
SKIP_TESTS=0
INSTALL=0

for arg in "$@"; do
    case "$arg" in
        --stage)       STAGE_ONLY=1 ;;
        --skip-tests)  SKIP_TESTS=1 ;;
        --install)     INSTALL=1 ;;
        *) echo "unknown option: $arg" >&2; exit 2 ;;
    esac
done

DIST="$ROOT/dist"
APP="$DIST/$APP_NAME.app"

amber() { printf '\033[38;5;214m%s\033[0m\n' "$*"; }
step()  { printf '\033[38;5;214m▸\033[0m %s\n' "$*"; }
die()   { printf '\033[38;5;203merror\033[0m %s\n' "$*" >&2; exit 1; }

amber "Sreon — The Next Generation of Browsing  v$VERSION ($ARCH)"

# ----------------------------------------------------------- compiler
step "building the SPRFST compiler & runtime"
make -j"$(nproc || sysctl -n hw.ncpu || echo 4)" >/dev/null
[ -x build/bin/sprfst ] || die "the compiler did not build"

# -------------------------------------------------------------- tests
if [ "$SKIP_TESTS" = 1 ]; then
    printf '    %s\n' "skipped tests (--skip-tests)"
else
    step "running test suite"
    ./tests/run_tests.sh >/dev/null && echo "    all core language & engine tests passed"
fi

step "verifying Swift sources"
./tools/check_swift.sh >/dev/null && echo "    Swift sources passed static checks"

# -------------------------------------------------------------- icons
step "generating Sreon icon assets & Sreon.icns"
python3 tools/generate_sreon_assets.py >/dev/null
[ -f "dist/Sreon.icns" ] || die "failed to generate Sreon.icns"

# ------------------------------------------------------------- bundle
step "laying out Sreon.app bundle"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key><string>$APP_NAME</string>
    <key>CFBundleDisplayName</key><string>Sreon</string>
    <key>CFBundleExecutable</key><string>$EXECUTABLE</string>
    <key>CFBundleIdentifier</key><string>$BUNDLE_ID</string>
    <key>CFBundleVersion</key><string>$VERSION</string>
    <key>CFBundleShortVersionString</key><string>$VERSION</string>
    <key>CFBundlePackageType</key><string>APPL</string>
    <key>CFBundleIconFile</key><string>Sreon</string>
    <key>LSMinimumSystemVersion</key><string>12.0</string>
    <key>NSHighResolutionCapable</key><true/>
    <key>NSRequiresAquaSystemAppearance</key><false/>
    <key>NSSupportsAutomaticTermination</key><false/>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key><string>Web Page</string>
            <key>CFBundleURLSchemes</key>
            <array><string>http</string><string>https</string></array>
            <key>LSHandlerRank</key><string>Owner</string>
        </dict>
        <dict>
            <key>CFBundleURLName</key><string>Sreon Page</string>
            <key>CFBundleURLSchemes</key><array><string>sreon</string><string>sprfst</string></array>
            <key>LSHandlerRank</key><string>Owner</string>
        </dict>
    </array>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key><true/>
    </dict>
</dict>
</plist>
PLIST

cp "dist/Sreon.icns" "$APP/Contents/Resources/Sreon.icns"

# ---------------------------------------------------------- resources
step "bundling Sreon engine & resources"
mkdir -p "$APP/Contents/Resources/bin" \
         "$APP/Contents/Resources/engine" \
         "$APP/Contents/Resources/ui" \
         "$APP/Contents/Resources/std" \
         "$APP/Contents/Resources/guidebook"

cp build/bin/sprfst "$APP/Contents/Resources/bin/sprfst"
chmod +x "$APP/Contents/Resources/bin/sprfst"
cp -R sreon/engine/* "$APP/Contents/Resources/engine/"
cp -R sreon/ui/*     "$APP/Contents/Resources/ui/"
cp -R std/*          "$APP/Contents/Resources/std/"
cp -R guidebook/*    "$APP/Contents/Resources/guidebook/"

# --------------------------------------------------------------- binary
if command -v swiftc >/dev/null 2>&1 && [ "$(uname -s)" = "Darwin" ]; then
    step "compiling native macOS Swift / WKWebView binary"
    swiftc \
        -target "${ARCH}-apple-macos12.0" \
        -O -whole-module-optimization \
        -framework AppKit -framework WebKit -framework Foundation \
        -o "$APP/Contents/MacOS/$EXECUTABLE" \
        sreon/macos/Sources/*.swift

    step "signing bundle (ad-hoc)"
    codesign --force --deep --sign - "$APP" 2>/dev/null || true
    amber "built native macOS app: $APP"
else
    step "creating Sreon application launcher script (portable runner)"
    cat > "$APP/Contents/MacOS/$EXECUTABLE" <<'SH'
#!/bin/bash
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"

# Open Sreon using native or default browser preview
if command -v open >/dev/null 2>&1; then
    open "$HERE/../Resources/ui/index.html"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$HERE/../Resources/ui/index.html"
else
    echo "Sreon Application Bundle"
    echo "UI: $HERE/../Resources/ui/index.html"
fi
SH
    chmod +x "$APP/Contents/MacOS/$EXECUTABLE"
    amber "staged application bundle: $APP"
fi

if [ "$INSTALL" = 1 ]; then
    step "installing Sreon to /Applications"
    rm -rf "/Applications/$APP_NAME.app"
    cp -R "$APP" "/Applications/"
    echo "installed /Applications/$APP_NAME.app"
    open "/Applications/$APP_NAME.app" || true
fi

echo
amber "Done! Built $APP"
echo
