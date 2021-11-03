const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

const cleanup = core.getBooleanInput('cleanup');

if (cleanup) {
    var resource_arn = core.getState("create-upload");

    var params = {
        arn: resource_arn
    };

    console.log("Removing resource with ARN: " + resource_arn);
    devicefarm.deleteUpload(params)
        .then(data => {core.setOutput("data", data)})
        .catch(err => {core.setFailed(err)})
}
