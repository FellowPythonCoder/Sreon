import Foundation
import CoreGraphics

struct MarkerFrame:Sendable{var timestamp:TimeInterval;var blobs:[MarkerBlob]}
struct MarkerBlob:Sendable,Equatable{var centroid:CGPoint;var area:Int}
enum MarkerGesture:String,Sendable{case hover="HOVER",draw="DRAW",erase="ERASE"}
protocol MarkerTracking:AnyObject,Sendable{var onFrame:(@Sendable (MarkerFrame)->Void)?{get set};func start();func stop()}

struct GestureStateMachine:Sendable{
 private(set)var state=MarkerGesture.hover;private var candidate=MarkerGesture.hover;private var count=0;var hysteresisFrames=3
 mutating func update(blobCount:Int)->MarkerGesture{let next:MarkerGesture=blobCount>=2 ? .draw:blobCount==1 ? .erase:.hover;if next==candidate{count+=1}else{candidate=next;count=1};if count>=hysteresisFrames{state=candidate};return state}
}

struct OneEuroFilter:Sendable{
 var minCutoff=1.0;var beta=0.025;var derivativeCutoff=1.0;private var last:CGPoint?;private var derivative=CGPoint.zero;private var lastTime:TimeInterval?
 mutating func filter(_ point:CGPoint,time:TimeInterval)->CGPoint{guard let l=last,let t=lastTime else{last=point;lastTime=time;return point};let dt=max(1.0/120,time-t);let dx=CGPoint(x:(point.x-l.x)/dt,y:(point.y-l.y)/dt);let ad=alpha(derivativeCutoff,dt);derivative=CGPoint(x:ad*dx.x+(1-ad)*derivative.x,y:ad*dx.y+(1-ad)*derivative.y);let speed=hypot(derivative.x,derivative.y);let a=alpha(minCutoff+beta*speed,dt);let output=CGPoint(x:a*point.x+(1-a)*l.x,y:a*point.y+(1-a)*l.y);last=output;lastTime=time;return output}
 private func alpha(_ cutoff:Double,_ dt:Double)->Double{let tau=1/(2*Double.pi*cutoff);return 1/(1+tau/dt)}
}

struct HSVPixel{var h:Double;var s:Double;var v:Double
 static func from(r:Double,g:Double,b:Double)->Self{let maxv=max(r,g,b),minv=min(r,g,b),d=maxv-minv;var h=0.0;if d != 0{if maxv==r{h=((g-b)/d).truncatingRemainder(dividingBy:6)}else if maxv==g{h=(b-r)/d+2}else{h=(r-g)/d+4};h/=6;if h<0{h+=1}};return Self(h:h,s:maxv==0 ? 0:d/maxv,v:maxv)}
 func matches(_ p:ColorProfile)->Bool{let hd=min(abs(h-p.hue),1-abs(h-p.hue));return hd<=p.tolerance && abs(s-p.saturation)<=p.tolerance*1.5 && abs(v-p.value)<=p.tolerance*1.5}}
}
