const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");

var params = {};
var params_test = {};

params.appArn = core.getInput('app_arn');
// alternative selection method would be via filters in
// deviceSelectionConfiguration - as pool arn is way easier
// stick with that for now
params.devicePoolArn = core.getInput('device_pool_arn');
params.projectArn = core.getInput('project_arn');
params.name = core.getInput('name');

params_test.type = core.getInput('test_type');
params_test.testPackageArn = core.getInput('test_package_arn');
params_test.testSpecArn = core.getInput('test_spec_arn');

if (!devicefarm.validateParameters(params,
                                   {appArn: 'app_arn',
                                    name: '',
                                    devicePoolArn: 'device_pool_arn',
                                    projectArn: 'project_arn'})) {
    return;
}

if (!devicefarm.validateParameters(params_test,
                                   {type: 'test_type',
                                    testPackageArn: 'test_package_arn',
                                    testSpecArn: 'test_spec_arn'})) {
    return;
}

params.test = params_test;

devicefarm.scheduleRun(params)
    .then(data => {
        core.setOutput("data", data);
        core.setOutput("arn", data.run.arn);
        core.setOutput("parsing_result_url", data.run.parsingResultUrl);
        core.setOutput("result_code", data.run.resultCode);
        core.setOutput("status", data.run.status);
    })
    .catch(err => {core.setFailed(err)})
