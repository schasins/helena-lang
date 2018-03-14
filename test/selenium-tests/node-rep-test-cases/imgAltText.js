/* Google.html */
var result = NodeRep.nodeToText(document.getElementById('hplogo'));
var expected = "Google url(file:///C:/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png)";
return {
    passed: result == expected,
    result: result,
    expected: expected
}