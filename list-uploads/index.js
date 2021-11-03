const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
params.arn = core.getInput('project_arn');

if (!devicefarm.validateParameters(params,
                                   {arn: 'project_arn'})) {
    return;
}

devicefarm.listUploads(params)
    .then(data => {core.setOutput("data", data)})
    .catch(err => {core.setFailed(err)})
