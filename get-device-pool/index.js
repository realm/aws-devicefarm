const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
params.arn = core.getInput('device_pool_arn');

if (!devicefarm.validateParameters(params,
                                   {arn: 'device_pool_arn'})) {
    return;
}

devicefarm.getDevicePool(params)
    .then(data => {
        core.setOutput("data", data);
        core.setOutput("name", data.devicePool.name);
        core.setOutput("description", data.devicePool.description);
        core.setOutput("type", data.devicePool.type);
    })
    .catch(err => {core.setFailed(err)})
