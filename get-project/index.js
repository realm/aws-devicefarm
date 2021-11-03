const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
params.arn = core.getInput('project_arn');

if (!devicefarm.validateParameters(params,
                                   {arn: 'project_arn'})) {
    return;
}

devicefarm.getProject(params)
    .then(data => {
        core.setOutput("data", data);
        core.setOutput("name", data.project.name);
        core.setOutput("created", data.project.created);
    })
    .catch(err => {core.setFailed(err)})
