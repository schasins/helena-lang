/* Google.html */
var result = NodeRep.nodeToText(document.getElementById('hplogo'));
var expected = "Google url(file:///C:/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png)";
return {
    passed: result.slice(0,10) === expected.slice(0,10) && result.slice(-30) === expected.slice(-30),
    result: result,
    expected: expected
}