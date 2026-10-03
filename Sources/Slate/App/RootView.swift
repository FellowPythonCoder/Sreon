import SwiftUI

struct RootView: View {
    @EnvironmentObject var store: BoardStore; @State private var palette=false; @State private var inspector=false; @State private var toolbarVisible=true
    var body: some View { ZStack {
        Color(nsColor:.windowBackgroundColor).ignoresSafeArea(); SlateCanvas().environmentObject(store)
        if !store.presentationMode { VStack { TopBar(palette:$palette); Spacer(); ToolDock().opacity(toolbarVisible ? 1:0.25).animation(.easeOut(duration:0.15),value:toolbarVisible).padding(.bottom,20) }.padding(12) }
        if !store.selection.isEmpty && !store.presentationMode { HStack { Spacer(); InspectorView().frame(width:260).padding(.trailing,12) } }
        if store.showLibrary { BoardLibrary().transition(.opacity) }
        if palette { CommandPalette(isPresented:$palette) }
        if store.cameraEnabled { VStack { Spacer(); HStack { CameraPanel(); Spacer() } }.padding(16) }
    }.onKeyPress("k",phases:.down){press in if press.modifiers.contains(.command){palette.toggle();return .handled};return .ignored}.accessibilityLabel("Slate whiteboard") }
}

struct TopBar: View {
 @EnvironmentObject var store: BoardStore
 @Binding var palette: Bool
 var body: some View {
  HStack(spacing: 8) {
   Button(action: { store.showLibrary = true }) { Image(systemName: "square.grid.2x2") }.help("Board library")
   TextField("Board name", text: Binding(get: { store.current.name }, set: { value in store.mutate { $0.name = value } })).textFieldStyle(.plain).font(.headline).frame(width: 220)
   Spacer(); Text("\(Int(store.zoom*100))%").font(.caption.monospacedDigit()).foregroundStyle(.secondary)
   Button(action: { palette = true }) { Label("Commands", systemImage: "command").font(.caption) }
   Button(action: { store.cameraEnabled.toggle() }) { Image(systemName: store.cameraEnabled ? "camera.fill" : "camera") }.help("Camera marker mode")
  }.padding(.horizontal, 12).frame(height: 40).background(.regularMaterial).clipShape(RoundedRectangle(cornerRadius: 10)).shadow(color: .black.opacity(0.09), radius: 5, y: 2)
 }
}

struct ToolDock: View {
 @EnvironmentObject var store: BoardStore
 let primary: [SlateTool] = [.select, .pen, .highlighter, .strokeEraser, .text, .rectangle, .ellipse, .arrow, .sticky, .hand, .lasso]
 var body: some View {
  HStack(spacing: 2) {
   ForEach(primary, id: \.self) { tool in
    Button(action: { store.tool = tool }) { Image(systemName: tool.symbol).frame(width: 28, height: 28).background(store.tool == tool ? Color.accentColor.opacity(0.15) : Color.clear).clipShape(RoundedRectangle(cornerRadius: 6)) }.buttonStyle(.plain).help(tool.title).accessibilityLabel(tool.title)
   }
   Divider().frame(height: 24)
   Menu { ForEach(SlateTool.allCases.filter { !primary.contains($0) }, id: \.self) { tool in Button(tool.title) { store.tool = tool } } } label: { Image(systemName: "ellipsis").frame(width: 28, height: 28) }
  }.padding(6).background(.regularMaterial).clipShape(RoundedRectangle(cornerRadius: 10)).overlay(RoundedRectangle(cornerRadius: 10).stroke(.separator.opacity(0.45), lineWidth: 0.5)).shadow(color: .black.opacity(0.12), radius: 6, y: 2)
 }
}
