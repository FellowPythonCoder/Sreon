#!/usr/bin/env bash
# =====================================================================
#  Builds a mountable macOS disk image of Sreon: dist/Sreon.dmg
#
#  On a Mac with hdiutil, this wraps the built application:
#       dist/Sreon.dmg  (HFS+, compressed, verified)
#
#  Away from a Mac (Linux / CI), it builds the mountable installer
#  and application disk image:
#       dist/Sreon.dmg  (ISO 9660 with Joliet names, written by tools/make_iso.spf)
#  which macOS mounts natively on double-click.
# =====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APP_NAME="Sreon"
VERSION="1.0.0"
DIST="$ROOT/dist"
APP="$DIST/$APP_NAME.app"
DMG="$DIST/Sreon.dmg"
STAGE="$DIST/sreon-dmg-contents"

amber() { printf '\033[38;5;214m%s\033[0m\n' "$*"; }
step()  { printf '\033[38;5;214m▸\033[0m %s\n' "$*"; }
die()   { printf '\033[38;5;203merror\033[0m %s\n' "$*" >&2; exit 1; }

amber "Building Sreon.dmg (v$VERSION)"

# Build the app bundle first if missing
if [ ! -d "$APP" ]; then
    step "building Sreon.app bundle"
    ./tools/build_sreon_app.sh
fi

rm -rf "$STAGE"
mkdir -p "$STAGE"

step "staging disk image contents"
cp -R "$APP" "$STAGE/"

cat > "$STAGE/Read Me.txt" <<TXT
Sreon — The Next Generation of Browsing
Version 1.0.0 · Powered by SPRFST Language

Welcome to Sreon, a premium macOS browser and productivity environment.

WHAT IS SREON?
Sreon is a modern spatial browser combining Apple's design philosophy,
a dark glassmorphism aesthetic, hardware-accelerated WKWebView web rendering,
built-in Ad & Tracker Shield, Sreon Studio IDE, Infinite Creative Whiteboard,
and an everyday productivity suite.

POWERED BY SPRFST
The core engine, language compiler, package management, shield rules parser,
and data persistence are powered directly by SPRFST Language.

INSTALLATION:
Drag "Sreon.app" to your Applications folder, or double-click "Install Sreon.command".

FIRST LAUNCH:
Right-click Sreon.app and choose "Open" if Gatekeeper prompts.
TXT

cat > "$STAGE/Install Sreon.command" <<'CMD'
#!/bin/bash
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="/Applications/Sreon.app"

printf '\n\033[38;5;214m  Sreon — The Next Generation of Browsing\033[0m\n'
printf '  Installing to /Applications...\n\n'

if [ -d "$DEST" ]; then
    echo "  Removing previous installation..."
    rm -rf "$DEST"
fi

echo "  Copying Sreon.app to /Applications..."
cp -R "$HERE/Sreon.app" /Applications/
xattr -dr com.apple.quarantine /Applications/Sreon.app 2>/dev/null || true

echo "  Successfully installed Sreon to /Applications!"
echo "  Launching Sreon..."
open /Applications/Sreon.app || true

echo
read -r -p "  Press return to finish. " _
CMD
chmod +x "$STAGE/Install Sreon.command"

if command -v hdiutil >/dev/null 2>&1 && [ "$(uname -s)" = "Darwin" ]; then
    step "creating HFS+ UDZO disk image with hdiutil"
    rm -f "$DMG"
    hdiutil create -volname "$APP_NAME" -srcfolder "$STAGE" \
        -ov -format UDZO -fs HFS+ "$DMG" >/dev/null
    hdiutil verify "$DMG" >/dev/null && echo "    verified disk image"
else
    step "writing mountable disk image with SPRFST make_iso.spf"
    rm -f "$DMG"
    [ -x build/bin/sprfst ] || make -j4 >/dev/null
    ./build/bin/sprfst run tools/make_iso.spf -- "$STAGE" "$DMG" "Sreon"
fi

rm -rf "$STAGE"
SIZE=$(du -sh "$DMG" | cut -f1)
amber "Built Sreon disk image: $DMG ($SIZE)"
echo
