const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");
const artifacts = require("../lib/artifacts.js");

var params = {};
params.arn = core.getInput('run_arn');
params.file_artifacts = core.getMultilineInput('file_artifacts');
params.log_artifacts = core.getMultilineInput('log_artifacts');
params.screenshot_artifacts = core.getMultilineInput('screenshot_artifacts');

if (!devicefarm.validateParameters(params,
                                   {arn: 'run_arn'})) {
    return;
}

artifacts.getArtifact(params)
    .then(data => {core.setOutput("data", data)})
    .catch(err => {core.setFailed(err)})
