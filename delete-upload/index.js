const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
params.arn = core.getInput('resource_arn');

if (!devicefarm.validateParameters(params,
                                   {arn: 'resource_arn'})) {
    return;
}

devicefarm.deleteUpload(params)
    .then(data => {core.setOutput("data", data)})
    .catch(err => {core.setFailed(err)})
