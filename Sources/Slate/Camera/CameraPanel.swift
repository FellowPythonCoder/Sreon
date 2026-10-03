import SwiftUI
import AVFoundation

struct CameraPanel:View{@EnvironmentObject var store:BoardStore;@State private var gesture=MarkerGesture.hover;@State private var tolerance=0.12;@State private var testMode=false
 var body:some View{VStack(alignment:.leading,spacing:10){HStack{Circle().fill(gesture == .draw ? .green:gesture == .erase ? .orange:.secondary).frame(width:8,height:8);Text(gesture.rawValue).font(.caption.bold());Spacer();Button{store.cameraEnabled=false}{Image(systemName:"xmark")}};CameraPreview(gesture:$gesture,profile:store.current.cameraProfile);HStack{Text("Tolerance").font(.caption);Slider(value:$tolerance,in:0.02...0.35)};Toggle("Test mode — no ink",isOn:$testMode).font(.caption);Text("Two markers draw · one erases").font(.caption2).foregroundStyle(.secondary)}.padding(12).frame(width:264).background(.regularMaterial).clipShape(RoundedRectangle(cornerRadius:12)).overlay(RoundedRectangle(cornerRadius:12).stroke(.separator.opacity(0.4),lineWidth:0.5)).shadow(color:.black.opacity(0.12),radius:8,y:3)} }
struct CameraPreview:NSViewRepresentable{@Binding var gesture:MarkerGesture;var profile:ColorProfile?
 func makeCoordinator()->Coordinator{Coordinator(self)}
 func makeNSView(context:Context)->PreviewView{let view=PreviewView();let tracker=context.coordinator.tracker;view.layer=AVCaptureVideoPreviewLayer(session:tracker.session);view.layer?.setAffineTransform(CGAffineTransform(scaleX:-1,y:1));tracker.onFrame={frame in Task{@MainActor in context.coordinator.machine.update(blobCount:frame.blobs.count);context.coordinator.parent.gesture=context.coordinator.machine.state}};tracker.start();return view}
 func updateNSView(_ v:PreviewView,context:Context){}
 static func dismantleNSView(_ v:PreviewView,coordinator:Coordinator){coordinator.tracker.stop()}
 final class Coordinator{@MainActor var parent:CameraPreview;let tracker=CameraMarkerTracker();var machine=GestureStateMachine();@MainActor init(_ p:CameraPreview){parent=p}}
}
final class PreviewView:NSView{override func layout(){super.layout();layer?.frame=bounds};override var intrinsicContentSize:NSSize{NSSize(width:240,height:135)}}
