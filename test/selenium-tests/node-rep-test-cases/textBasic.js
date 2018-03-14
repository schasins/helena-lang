/* EquineNow.html */
var element = document.getElementsByClassName("item-location")[0];
var result = NodeRep.nodeToText(element);
var expected = "Washington (11 mi)";
return {
    passed: result == expected,
    result: result,
    expected: expected
}
