#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
swift test
swift build -c release
rm -rf build/Slate.app build/dmg-root build/Slate.dmg
mkdir -p build/Slate.app/Contents/MacOS build/Slate.app/Contents/Resources build/dmg-root
cp .build/release/Slate build/Slate.app/Contents/MacOS/Slate
cp Sources/Slate/Resources/Info.plist build/Slate.app/Contents/Info.plist
if [ -d .build/release/Slate_Slate.bundle ]; then cp -R .build/release/Slate_Slate.bundle build/Slate.app/Contents/Resources/; fi
codesign --force --deep --sign - --entitlements Slate.entitlements build/Slate.app
cp -R build/Slate.app build/dmg-root/
ln -s /Applications build/dmg-root/Applications
hdiutil create -volname Slate -srcfolder build/dmg-root -ov -format UDZO build/Slate.dmg
codesign --verify --deep --strict build/Slate.app
spctl --assess --type execute build/Slate.app || true
echo "Created $ROOT/build/Slate.dmg"
