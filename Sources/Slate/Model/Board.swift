import Foundation
import CoreGraphics

struct RGBAColor: Codable, Hashable, Sendable {
    var red: Double; var green: Double; var blue: Double; var alpha: Double
    static let ink = Self(red: 0.12, green: 0.13, blue: 0.15, alpha: 1)
    static let accent = Self(red: 0.83, green: 0.29, blue: 0.20, alpha: 1)
    static let paper = Self(red: 0.98, green: 0.98, blue: 0.97, alpha: 1)
}

struct CanvasPoint: Codable, Hashable, Sendable {
    var x: Double; var y: Double; var pressure: Double = 1; var time: Double = 0
    var cgPoint: CGPoint { CGPoint(x: x, y: y) }
}

struct RectValue: Codable, Hashable, Sendable {
    var x: Double; var y: Double; var width: Double; var height: Double
    init(_ rect: CGRect) { x = rect.minX; y = rect.minY; width = rect.width; height = rect.height }
    init(x: Double, y: Double, width: Double, height: Double) { self.x=x; self.y=y; self.width=width; self.height=height }
    var cgRect: CGRect { CGRect(x: x, y: y, width: width, height: height) }
}

enum SlateTool: String, Codable, CaseIterable, Sendable {
    case select, pen, highlighter, strokeEraser, pixelEraser, text, rectangle, ellipse, line, arrow, diamond, triangle, sticky, connector, laser, hand, frame, image, lasso, eyedropper
    var title: String { rawValue.prefix(1).uppercased() + rawValue.dropFirst() }
    var symbol: String { switch self {
    case .select: "arrow.up.left"; case .pen: "pencil.tip"; case .highlighter: "highlighter"; case .strokeEraser,.pixelEraser: "eraser"; case .text: "textformat"; case .rectangle: "rectangle"; case .ellipse: "circle"; case .line: "line.diagonal"; case .arrow: "arrow.right"; case .diamond: "diamond"; case .triangle: "triangle"; case .sticky: "note"; case .connector: "point.topleft.down.to.point.bottomright.curvepath"; case .laser: "dot.radiowaves.left.and.right"; case .hand: "hand.draw"; case .frame: "viewfinder"; case .image: "photo"; case .lasso: "lasso"; case .eyedropper: "eyedropper" }
    }
}

enum ElementKind: String, Codable, Sendable { case stroke, highlighter, text, shape, sticky, image, frame, connector }
enum ShapeKind: String, Codable, Sendable { case rectangle, ellipse, line, arrow, diamond, triangle }
enum StrokePattern: String, Codable, CaseIterable, Sendable { case solid, dashed, dotted }
enum CanvasBackground: String, Codable, CaseIterable, Sendable { case blank, dots, grid, lines }

struct BoardElement: Identifiable, Codable, Hashable, Sendable {
    var id = UUID(); var kind: ElementKind; var points: [CanvasPoint] = []; var bounds = RectValue(x: 0, y: 0, width: 0, height: 0)
    var text: String?; var shape: ShapeKind?; var stroke = RGBAColor.ink; var fill: RGBAColor?; var width: Double = 3; var opacity: Double = 1
    var pattern = StrokePattern.solid; var rotation: Double = 0; var locked = false; var groupID: UUID?; var zIndex: Int = 0
    var fontName = "SF Pro"; var fontSize: Double = 18; var fontWeight = 0.0; var textAlignment = 0
}

struct Board: Identifiable, Codable, Hashable, Sendable {
    static let schemaVersion = 1
    var schemaVersion = Self.schemaVersion; var id = UUID(); var name = "Untitled Board"; var createdAt = Date(); var modifiedAt = Date(); var favorite = false
    var elements: [BoardElement] = []; var background = CanvasBackground.blank; var customPalette: [RGBAColor] = [.ink, .accent]
    var cameraProfile: ColorProfile?; var activeArea = RectValue(x: 0.08, y: 0.08, width: 0.84, height: 0.84)
    var searchableText: String { ([name] + elements.compactMap(\.text)).joined(separator: " ") }
}

struct ColorProfile: Codable, Hashable, Sendable, Identifiable {
    var id = UUID(); var name = "Marker"; var hue: Double; var saturation: Double; var value: Double; var tolerance: Double = 0.12; var minimumBlobSize = 18
}

struct SlatePackage: Codable, Sendable { var schemaVersion = Board.schemaVersion; var board: Board; var snapshots: [BoardSnapshot] = [] }
struct BoardSnapshot: Codable, Identifiable, Sendable { var id = UUID(); var date = Date(); var label: String; var board: Board }
