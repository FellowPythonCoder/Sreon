import SwiftUI
import UniformTypeIdentifiers

extension UTType { static let slate = UTType(exportedAs: "com.slate.whiteboard") }

@MainActor
final class BoardStore: ObservableObject {
    @Published var boards: [Board] = []; @Published var current: Board; @Published var selection = Set<UUID>(); @Published var tool: SlateTool = .pen
    @Published var zoom = 1.0; @Published var pan = CGSize.zero; @Published var showLibrary = false; @Published var showInspector = false
    @Published var cameraEnabled = false; @Published var presentationMode = false; @Published var statusMessage = "Ready"
    let history = CommandHistory(); private let folder: URL; private var saveTask: Task<Void, Never>?
    init() {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        folder = base.appendingPathComponent("Slate/Boards", isDirectory: true); try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        let loaded = Self.loadBoards(from: folder); boards = loaded; current = loaded.sorted { $0.modifiedAt > $1.modifiedAt }.first ?? Board(name: "First Board")
        if loaded.isEmpty { boards = [current]; persist() }
    }
    private static func loadBoards(from folder: URL) -> [Board] { (try? FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil))?.filter { $0.pathExtension == "slate" }.compactMap { url in guard let data=try? Data(contentsOf:url), let package=try? JSONDecoder().decode(SlatePackage.self,from:data) else{return nil}; return package.board } ?? [] }
    func mutate(_ action: (inout Board) -> Void) { history.record(current); action(&current); current.modifiedAt=Date(); syncAndScheduleSave() }
    func syncAndScheduleSave() { if let i=boards.firstIndex(where:{$0.id==current.id}) { boards[i]=current } else { boards.append(current) }; saveTask?.cancel(); saveTask=Task { try? await Task.sleep(for:.milliseconds(180)); guard !Task.isCancelled else{return}; persist() } }
    func persist() { let board=current; let url=folder.appendingPathComponent("\(board.id.uuidString).slate"); let old=(try? Data(contentsOf:url)).flatMap{try? JSONDecoder().decode(SlatePackage.self,from:$0)}; let package=SlatePackage(board:board,snapshots:old?.snapshots ?? []); if let data=try? JSONEncoder().encode(package){try? data.write(to:url,options:.atomic)} }
    func newBoard() { current=Board(); boards.append(current); selection=[]; persist() }
    func open(_ board: Board) { current=board; selection=[]; showLibrary=false }
    func delete(_ board: Board) { boards.removeAll{$0.id==board.id}; try? FileManager.default.removeItem(at:folder.appendingPathComponent("\(board.id.uuidString).slate")); if current.id==board.id { current=boards.first ?? Board(); if boards.isEmpty { boards=[current] } } }
    func duplicate(_ board: Board) { var copy=board; copy.id=UUID(); copy.name += " Copy"; copy.createdAt=Date(); copy.modifiedAt=Date(); current=copy; boards.append(copy); persist() }
    func undo() { if let b=history.undo(current:current){current=b;syncAndScheduleSave()} }; func redo(){if let b=history.redo(current:current){current=b;syncAndScheduleSave()} }
    func duplicateSelection() { let selected=current.elements.filter{selection.contains($0.id)}; mutate { board in var ids=Set<UUID>(); for var e in selected { e.id=UUID();e.bounds.x+=16;e.bounds.y+=16;ids.insert(e.id);board.elements.append(e) }; selection=ids } }
    func deleteSelection(){mutate{$0.elements.removeAll{selection.contains($0.id)}};selection=[]}
    func toggleLock(){mutate{b in for i in b.elements.indices where selection.contains(b.elements[i].id){b.elements[i].locked.toggle()}}}
    func moveZ(_ front:Bool){mutate{b in for i in b.elements.indices where selection.contains(b.elements[i].id){b.elements[i].zIndex += front ? 1 : -1}}}
    func exportPackage(to url:URL)throws{let data=try JSONEncoder().encode(SlatePackage(board:current));try data.write(to:url,options:.atomic)}
    func importPackage(from url:URL)throws{let package=try JSONDecoder().decode(SlatePackage.self,from:Data(contentsOf:url));current=package.board;boards.removeAll{$0.id==current.id};boards.append(current);persist()}
    func snapshot(label:String="Snapshot") { persist(); let url=folder.appendingPathComponent("\(current.id.uuidString).slate"); var p=(try? Data(contentsOf:url)).flatMap{try? JSONDecoder().decode(SlatePackage.self,from:$0)} ?? SlatePackage(board:current); p.snapshots.append(BoardSnapshot(label:label,board:current)); if let d=try? JSONEncoder().encode(p){try? d.write(to:url,options:.atomic)} }
}
