import XCTest
@testable import Slate

final class SlateTests:XCTestCase{
 func testBoardJSONRoundTrip()throws{var b=Board(name:"Test");b.elements.append(BoardElement(kind:.text,text:"Hello"));let data=try JSONEncoder().encode(b);let decoded=try JSONDecoder().decode(Board.self,from:data);XCTAssertEqual(decoded,b);XCTAssertEqual(decoded.searchableText,"Test Hello")}
 func testGuideParser(){let p=VisualGuideParser();let n=p.parse("# Plan\n1. Start\n- Verify\nA vs B\nDue 2026");XCTAssertEqual(n.count,5);XCTAssertEqual(n[0].kind,.heading);XCTAssertEqual(n[1].kind,.step);XCTAssertEqual(n[3].kind,.comparison);XCTAssertEqual(n[4].kind,.date)}
 func testGestureHysteresis(){var m=GestureStateMachine();XCTAssertEqual(m.update(blobCount:2),.hover);XCTAssertEqual(m.update(blobCount:2),.hover);XCTAssertEqual(m.update(blobCount:2),.draw);XCTAssertEqual(m.update(blobCount:1),.draw);XCTAssertEqual(m.update(blobCount:1),.draw);XCTAssertEqual(m.update(blobCount:1),.erase)}
 func testOneEuroFilter(){var f=OneEuroFilter();XCTAssertEqual(f.filter(.zero,time:0),.zero);let p=f.filter(CGPoint(x:100,y:0),time:0.016);XCTAssertGreaterThan(p.x,0);XCTAssertLessThan(p.x,100)}
 func testSimplification(){let p=(0..<100).map{CanvasPoint(x:Double($0)/10,y:0)};XCTAssertLessThan(ElementEditor.simplify(p,tolerance:1).count,p.count)}
}
