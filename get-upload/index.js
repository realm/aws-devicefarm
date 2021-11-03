const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
params.arn = core.getInput('resource_arn');

if (!devicefarm.validateParameters(params,
                                   {arn: 'resource_arn'})) {
    return;
}

devicefarm.getUpload(params)
    .then(data => {
        core.setOutput("data", data);
        core.setOutput("created", data.upload.created);
        core.setOutput("metadata", data.upload.metadata);
        core.setOutput("type", data.upload.type);
        core.setOutput("status", data.upload.status);
    })
    .catch(err => {core.setFailed(err)})
