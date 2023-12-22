const core = require('@actions/core');
const devicefarm = require("../lib/aws-devicefarm.js");
const run = require("../lib/schedule-run.js");

var params = {};

params.devicePoolArn = core.getInput('device_pool_arn');
params.projectArn = core.getInput('project_arn');
params.name = core.getInput('name');

params.appArn = core.getInput('app_arn');
params.appFile = core.getInput('app_file');
params.auxiliaryApps = core.getInput('app_auxiliary_files');
params.appType = core.getInput('app_type');

params.timeout = core.getInput('timeout');

params.testType = core.getInput('test_type');

params.test_spec = core.getInput('test_spec');
params.testSpecArn = core.getInput('test_spec_arn');
params.testSpecFile = core.getInput('test_spec_file');
params.testSpecType = core.getInput('test_spec_type');

params.testPackageArn = core.getInput('test_package_arn');
params.testPackageFile = core.getInput('test_package_file');
params.testPackageType = core.getInput('test_package_type');

params.devicePoolArn = core.getInput('device_pool_arn');
params.projectArn = core.getInput('project_arn');
params.name = core.getInput('name');

params.remote_src = core.getInput('remote_src');
params.cleanup = core.getInput('cleanup');

params.file_artifacts = core.getMultilineInput('file_artifacts');
params.log_artifacts = core.getMultilineInput('log_artifacts');
params.screenshot_artifacts = core.getMultilineInput('screenshot_artifacts');

if (!devicefarm.validateParameters(params,
                                   {devicePoolArn: 'device_pool_arn',
                                    projectArn: 'project_arn'})) {
    return;
}

// TODO: add support for cleanups
// TODO: parameter validation
// app_arn || (app_file && app_type)
// test_package_arn || (test_package_file && test_package_type)
// test_spec_arn || (test_spec_file && test_spec_type)
// TODO: initialize the types with sanish defaults

run.scheduleRun(params)
    .then(data => {
        core.setOutput("data", data);
        core.setOutput("arn", data.run.arn);
        core.setOutput("parsing_result_url", data.run.parsingResultUrl);
        core.setOutput("result_code", data.run.resultCode);
        core.setOutput("status", data.run.status);
    })
    .catch(err => {core.setFailed(err)})
