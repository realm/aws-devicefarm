const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
params.arn = core.getInput('project_arn');
params.type = core.getInput('type');

if (!devicefarm.validateParameters(params,
                                   {arn: 'project_arn',
                                    type: ''})) {
    return;
}

devicefarm.listDevicePools(params)
    .then(data => {core.setOutput("data", data)})
    .catch(err => {core.setFailed(err)})
