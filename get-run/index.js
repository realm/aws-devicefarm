const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
params.arn = core.getInput('run_arn');

if (!devicefarm.validateParameters(params,
                                   {arn: 'run_arn'})) {
    return;
}

devicefarm.getRun(params)
    .then(data => {
        core.setOutput("data", data);
        core.setOutput("created", data.run.created);
        core.setOutput("message", data.run.message);
        core.setOutput("name", data.run.name);
        core.setOutput("parsing_result_url", data.run.parsingResultUrl);
        core.setOutput("platform", data.run.platform);
        core.setOutput("result", data.run.result);
        core.setOutput("result_code", data.run.resultCode);
        core.setOutput("status", data.run.status);
        core.setOutput("type", data.run.type);
    })
    .catch(err => {core.setFailed(err)})
