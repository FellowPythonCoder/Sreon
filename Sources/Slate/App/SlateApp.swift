import SwiftUI

@main struct SlateApp: App {
    @StateObject private var store = BoardStore()
    var body: some Scene {
        WindowGroup("Slate") { RootView().environmentObject(store).frame(minWidth:900,minHeight:620).onOpenURL { try? store.importPackage(from:$0) } }
            .windowStyle(.hiddenTitleBar).commands { SlateCommands(store:store) }
        Settings { SettingsView().environmentObject(store).frame(width:480,height:400) }
    }
}

struct SlateCommands: Commands {
    @ObservedObject var store: BoardStore
    var body: some Commands {
        CommandGroup(replacing:.newItem){Button("New Board"){store.newBoard()}.keyboardShortcut("n");Button("Board Library"){store.showLibrary.toggle()}.keyboardShortcut("b",modifiers:[.command,.shift])}
        CommandGroup(replacing:.undoRedo){Button("Undo"){store.undo()}.keyboardShortcut("z").disabled(!store.history.canUndo);Button("Redo"){store.redo()}.keyboardShortcut("z",modifiers:[.command,.shift]).disabled(!store.history.canRedo)}
        CommandMenu("Tools"){ForEach(SlateTool.allCases,id:\.self){tool in Button(tool.title){store.tool=tool}.keyboardShortcut(shortcut(tool),modifiers:[])}}
        CommandMenu("Arrange"){Button("Duplicate"){store.duplicateSelection()}.keyboardShortcut("d");Button("Lock / Unlock"){store.toggleLock()}.keyboardShortcut("l",modifiers:[.command,.shift]);Divider();Button("Bring Forward"){store.moveZ(true)};Button("Send Backward"){store.moveZ(false)}}
        CommandMenu("View"){Button("Zoom to Fit"){store.zoom=1;store.pan=.zero}.keyboardShortcut("0");Button("Presentation Mode"){store.presentationMode.toggle()}.keyboardShortcut(.return,modifiers:[.command,.shift]);Button("Toggle Camera Mode"){store.cameraEnabled.toggle()}.keyboardShortcut("c",modifiers:[.command,.shift])}
    }
    private func shortcut(_ t:SlateTool)->KeyEquivalent { switch t {case .select:"v";case .pen:"p";case .highlighter:"h";case .strokeEraser:"e";case .text:"t";case .rectangle:"r";case .ellipse:"o";case .line:"l";case .hand:"m";default:"1"} }
}
