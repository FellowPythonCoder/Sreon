#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

cargo build --release --manifest-path native/Cargo.toml
mkdir -p release release/AppDir/usr/bin release/AppDir/usr/share/applications release/AppDir/usr/share/icons/hicolor/512x512/apps
cp native/target/release/sreon release/AppDir/usr/bin/sreon
cp native/packaging/sreon.desktop release/AppDir/usr/share/applications/sreon.desktop
cp native/assets/sreon.png release/AppDir/usr/share/icons/hicolor/512x512/apps/sreon.png

cat > release/AppDir/AppRun <<'APP_RUN'
#!/usr/bin/env sh
HERE="$(dirname "$(readlink -f "$0")")"
exec "$HERE/usr/bin/sreon" "$@"
APP_RUN
chmod +x release/AppDir/AppRun

if command -v cargo-deb >/dev/null 2>&1; then
  cargo deb --manifest-path native/Cargo.toml --output release/Sreon.deb
else
  echo "cargo-deb not installed; skipping release/Sreon.deb"
fi

if command -v cargo-rpm >/dev/null 2>&1; then
  cargo rpm build --manifest-path native/Cargo.toml
else
  echo "cargo-rpm not installed; skipping the RPM package"
fi

if command -v appimagetool >/dev/null 2>&1; then
  APPIMAGE_EXTRACT_AND_RUN=1 appimagetool release/AppDir release/Sreon.AppImage
else
  echo "AppDir created at release/AppDir. Install appimagetool to finish release/Sreon.AppImage."
fi

echo "Linux binary: native/target/release/sreon"
