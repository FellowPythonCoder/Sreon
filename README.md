# Slate

Slate is a private, native whiteboard for macOS 14 and later. It uses Swift 6, SwiftUI, AppKit, Metal, AVFoundation, and Accelerate—without third-party packages, accounts, analytics, network code, or AI/ML.

## Project structure

```text
Slate.entitlements                 Sandbox + camera + user-selected files
Package.swift                      Swift 6 Xcode/Swift Package project
Sources/Slate/
  App/                             App scene, board library, inspector, commands
  Canvas/SlateCanvas.swift         AppKit events + Metal presentation canvas
  Camera/                          AVFoundation tracker, HSV rules, One Euro filter
  Export/ExportService.swift       PNG, clipboard, PDF
  Guide/VisualGuideParser.swift    Deterministic text-to-visual parser
  Model/                           Versioned value model, history, persistence
  Resources/Info.plist             App metadata and camera disclosure
Tests/SlateTests/                  Model, parser, filter, gesture, persistence tests
scripts/build-dmg.sh               Release app bundle and DMG builder
```

## Build in Xcode

1. Use macOS 14+ and Xcode 16. Open `Package.swift` in Xcode.
2. Select **My Mac**, then run the `Slate` scheme.
3. Allow camera access only if using marker mode.

For a distributable, ad-hoc signed disk image:

```bash
chmod +x scripts/build-dmg.sh
scripts/build-dmg.sh
open build/Slate.dmg
```

The resulting DMG contains `Slate.app` and an Applications shortcut. The ad-hoc build is not notarized; Control-click **Open** on first launch if Gatekeeper asks. Production distribution requires signing with your Apple Developer ID and notarization.

## Implemented phases

1. **Canvas + ink + persistence:** Metal-backed high-refresh view, low-latency AppKit pointer handling, simplified ink, highlighter, eraser, infinite pan/zoom, versioned JSON `.slate` packages, debounced autosave and restore.
2. **Tools + editing:** 20 tool modes, native shortcuts, multi-selection, move, duplicate, delete, grouping, locking, z-order, inspector, opacity/width/pattern model, shapes, notes, text, Shift-constrained geometry, backgrounds, undo/redo.
3. **Library + export:** searchable board grid, favorite/duplicate/delete, snapshots, PNG/PDF, clipboard, local package import/export model, presentation chrome suppression.
4. **Camera:** local AVFoundation capture, HSV thresholding, blob centroids, three-frame gesture hysteresis, mirrored preview, One Euro filter, tolerance/test-mode controls, profile and active-area model.
5. **Text to guide:** deterministic heading, bullet, numbered-step, arrow, `vs`, and year parser; editable step card, flow, mind-map, timeline, checklist, and comparison layouts.
6. **Polish/performance:** adaptive 60/120 Hz Metal presentation, off-main camera queue, coalesced saves, reduced committed path points, native menus, VoiceOver labels, light/dark appearance, restrained motion.

Some advanced controls are represented in the model or command architecture but remain intentionally compact in this first build: pixel erasing currently captures a partial-erase path but does not split committed strokes; image drag-in accepts text while bitmap placement is pending; SVG export, rich-text editing UI, alignment guides, minimap/rulers, connector reflow, frame sequencing, and full snapshot restore UI are not complete. Camera processing is downsampled and deterministic, but mask morphology and calibration click UI need a follow-up. These limitations are stated rather than hidden.

## Shortcuts

| Action | Shortcut |
|---|---|
| Select / Pen / Highlighter / Eraser | V / P / H / E |
| Text / Rectangle / Ellipse / Line | T / R / O / L |
| Hand tool | M |
| New board | ⌘N |
| Undo / Redo | ⌘Z / ⇧⌘Z |
| Duplicate | ⌘D |
| Lock | ⇧⌘L |
| Board library | ⇧⌘B |
| Camera marker mode | ⇧⌘C |
| Command palette | ⌘K |
| Zoom to fit | ⌘0 |
| Presentation | ⇧⌘Return |
| Add to selection | Shift-click |
| Constrain shape | Shift-drag |

## Camera calibration tips

Use a brightly colored matte sticker or fingertip cap that differs from the background. Face an evenly lit area and avoid colors shared with clothing. Open camera mode with ⇧⌘C, keep the marker inside the active area, then increase tolerance only until the marker remains stable. Two visible marker blobs enter **DRAW**, one enters **ERASE**, and none enters **HOVER** after three stable frames. Test mode lets you verify detection without ink. Camera pixels are processed locally and are never saved or transmitted.
