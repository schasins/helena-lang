/* EquineNow.html */
var element = document.getElementsByClassName("cover")[0];
var result = NodeRep.nodeToText(element);
var expected = "url(\"https://img.equinenow.com/slir/w350-c5x4/equine/data/photos/1187344t/1515535774/hunter-under-saddle-holsteiner-horse.jpg\")";
return {
    passed: result == expected,
    result: result,
    expected: expected
}