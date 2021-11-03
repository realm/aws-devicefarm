const core = require('@actions/core');

const input = core.getInput('input');

if (!input) {
    console.log("JSON pretty print: empty input")
    return
}

var jsonData = JSON.parse(input);
console.log(JSON.stringify(jsonData));
