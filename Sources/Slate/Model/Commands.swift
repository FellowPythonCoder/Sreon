import Foundation

@MainActor
final class CommandHistory: ObservableObject {
    private var undoStack: [Board] = []; private var redoStack: [Board] = []
    var canUndo: Bool { !undoStack.isEmpty }; var canRedo: Bool { !redoStack.isEmpty }
    func record(_ board: Board) { undoStack.append(board); redoStack.removeAll(); if undoStack.count > 500 { undoStack.removeFirst() }; objectWillChange.send() }
    func undo(current: Board) -> Board? { guard let previous = undoStack.popLast() else { return nil }; redoStack.append(current); objectWillChange.send(); return previous }
    func redo(current: Board) -> Board? { guard let next = redoStack.popLast() else { return nil }; undoStack.append(current); objectWillChange.send(); return next }
}

enum ElementEditor {
    static func align(_ elements: inout [BoardElement], ids: Set<UUID>, edge: String) {
        let selected = elements.filter { ids.contains($0.id) }; guard selected.count > 1 else { return }
        let value: Double = switch edge { case "left": selected.map(\.bounds.x).min()!; case "right": selected.map { $0.bounds.x + $0.bounds.width }.max()!; case "top": selected.map(\.bounds.y).min()!; default: selected.map { $0.bounds.y + $0.bounds.height }.max()! }
        for index in elements.indices where ids.contains(elements[index].id) { switch edge { case "left": elements[index].bounds.x = value; case "right": elements[index].bounds.x = value-elements[index].bounds.width; case "top": elements[index].bounds.y = value; default: elements[index].bounds.y = value-elements[index].bounds.height } }
    }
    static func group(_ elements: inout [BoardElement], ids: Set<UUID>) { let group = UUID(); for i in elements.indices where ids.contains(elements[i].id) { elements[i].groupID = group } }
    static func simplify(_ points: [CanvasPoint], tolerance: Double = 0.8) -> [CanvasPoint] {
        guard points.count > 2 else { return points }; var result = [points[0]]; var last = points[0]
        for point in points.dropFirst().dropLast() { let dx=point.x-last.x, dy=point.y-last.y; if dx*dx+dy*dy > tolerance*tolerance { result.append(point); last=point } }; result.append(points.last!); return result
    }
}
