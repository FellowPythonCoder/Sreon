#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

cargo install cargo-bundle --locked
(
  cd native
  cargo bundle --release
)
mkdir -p release
hdiutil create -volname Sreon -srcfolder native/target/release/bundle/osx/Sreon.app -ov -format UDZO release/Sreon.dmg
printf 'Created release/Sreon.dmg\n'
