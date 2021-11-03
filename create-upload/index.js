const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};

params.projectArn = core.getInput('project_arn');
params.name = core.getInput('name');
params.type = core.getInput('type');
const cleanup = core.getInput('cleanup');

if (!devicefarm.validateParameters(params,
                                   {projectArn: 'project_arn',
                                    name: '',
                                    type: ''})) {
    return;
}

devicefarm.createUpload(params)
    .then(data => {
        core.setOutput("data", data);
        core.setOutput("arn", data.upload.arn);
        core.setOutput("url", data.upload.url);
        core.setOutput("status", data.upload.status);
        if (cleanup) {
            core.saveState("create-upload", data.upload.arn);
        }

    })
    .catch(err => {core.setFailed(err)})
