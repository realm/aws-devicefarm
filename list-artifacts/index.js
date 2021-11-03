const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
params.arn = core.getInput('resource_arn');
params.type = core.getInput('type');

if (!devicefarm.validateParameters(params,
                                   {arn: 'project_arn',
                                    type: ''})) {
    return;
}

devicefarm.listArtifacts(params)
    .then(data => {core.setOutput("data", data)})
    .catch(err => {core.setFailed(err)})
