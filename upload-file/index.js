const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");
const file_upload = require("../lib/upload-file.js");

var params = {};

params.projectArn = core.getInput('project_arn');
params.file = core.getInput('file');
params.name = core.getInput('name');
params.type = core.getInput('type');
params.cleanup = core.getBooleanInput('cleanup');
params.remote_src = core.getBooleanInput('remote_src');

if (!devicefarm.validateParameters(params,
                                   {projectArn: 'project_arn',
                                    type: '',
                                    file: ''})) {
    return;
}

file_upload.uploadFile(params)
    .then(data => {
        core.setOutput("data", data);
        core.setOutput("arn", data.upload.arn);
        core.setOutput("url", data.upload.url);
        core.setOutput("status", data.upload.status);
    })
    .catch(err => {core.setFailed(err)})
