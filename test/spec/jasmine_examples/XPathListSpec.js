describe("XPathList", function() {

  require('../../../lib/json2');
  require('../../../content/xpath_rep');

  beforeEach(function() {
    // for a different module, it might be useful to put something in beforeEach.  but for this, not necessary
    // player = new Player();
  });

  it("should use JSON", function() {
    // this one doesn't need to be in here!  it's just a sample!  todo:remove eventually
    var a = {"a":"b", "2":3};
    var JSONAndBack = JSON.parse(JSON.stringify(a));
    expect(a).toEqual(JSONAndBack);
  });

  it("should turn xpaths into list representation", function() {
    var xpathList = XPathList.xPathToXPathList("HTML/BODY[1]/DIV[1]/DIV[5]/DIV[1]/DIV[1]/A[1]");
    var targetAnswer = JSON.parse('[{"nodeName":"BODY","index":"1","iterable":false},{"nodeName":"DIV","index":"1","iterable":false},{"nodeName":"DIV","index":"5","iterable":false},{"nodeName":"DIV","index":"1","iterable":false},{"nodeName":"DIV","index":"1","iterable":false},{"nodeName":"A","index":"1","iterable":false}]');
    expect(xpathList).toEqual(targetAnswer);
  });

});
