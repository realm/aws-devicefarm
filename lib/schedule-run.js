const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const artifacts = require('./artifacts.js');
const devicefarm = require('./aws-devicefarm.js');
const axios = require('axios');
const sleep = require('sleep-promise');
const file_upload = require("../lib/upload-file.js");

exports.scheduleRun = async function (params) {
    var name = github.run_id;

    // wait for 5 seconds between polling state of the execution
    var wait_interval=5;
    // 30 minute default timeout
    var max_wait = 1800/wait_interval;

    if (params.appArn && params.appFile) {
        core.setFailed("Only specify one of app_arn or app_file");
        return;
    }

    if (params.testSpecArn && params.testSpecFile) {
        core.setFailed("Only specify one of test_spec_arn or test_spec_file");
        return;
    }

    if (params.test_spec && params.test_spec.length && !params.testSpecFile) {
        core.setFailed("Setting test_spec also requires test_spec_file");
        return;
    }

    if (params.testPackageArn && params.testPackageFile) {
        core.setFailed("Only specify one of test_package_arn or test_package_file");
        return;
    }

    if (params.testPackageFile && !params.testPackageType) {
        core.setFailed("Setting test_package_file also requires test_package_type");
    }

    if (params.testSpecFile && !params.testSpecType) {
        core.setFailed("Setting test_spec_file also requires test_spec_type");
    }

    if (params.appFile && !params.appType) {
        core.setFailed("Setting app_file also requires app_type");
    }

    if (params.name) {
        name = params.name;
    }

    if (params.timeout) {
        max_wait = params.timeout/wait_interval;
    }

    if (params.appFile) {
        try {
            core.info("Checking app package upload");
            var app =
                await file_upload.uploadFile({
                    projectArn: params.projectArn,
                    remote_src: params.remote_src,
                    type: params.appType,
                    file: params.appFile});
            params.appArn = app.upload.arn;
        } catch (err) {
            throw("Unable to publish app file " + params.appFile + ", " + err);
        }
    }

    if (params.testSpecFile) {
        if (params.test_spec) {
            core.info(`Using inline test_spec. Writing it to ${params.testSpecFile}`);

            fs.writeFileSync(params.testSpecFile, params.test_spec);
        }

        try {
            core.info("Checking test spec upload");
            var test_spec =
                await file_upload.uploadFile({
                    projectArn: params.projectArn,
                    remote_src: params.remote_src,
                    type: params.testSpecType,
                    file: params.testSpecFile});
            params.testSpecArn = test_spec.upload.arn;
        } catch (err) {
            throw("Unable to publish test spec file " + params.testSpecFile + ", " + err);
        }
    }

    if (params.testPackageFile) {
        try {
            core.info("Checking test package upload");

            var test_package =
                await file_upload.uploadFile({
                    projectArn: params.projectArn,
                    remote_src: params.remote_src,
                    type: params.testPackageType,
                    file: params.testPackageFile});
            params.testPackageArn = test_package.upload.arn;
        } catch (err) {
            throw("Unable to publish test package file " + params.testPackageFile + ", " + err);
        }
    }

    // allow not using a custom test spec to fall back to the default
    // test environments
    var run_params_test = {
        type: params.testType,
        testPackageArn: params.testPackageArn
    }

    if (params.testSpecArn) {
        run_params_test.testSpecArn = params.testSpecArn
    } else {
        core.info("No test spec provided - executing with a default environment.");
    }

    var run_params = {
        appArn: params.appArn,
        name: name,
        devicePoolArn: params.devicePoolArn,
        projectArn: params.projectArn,
        test: run_params_test
    }

    var run = await devicefarm.scheduleRun(run_params);

    var run_status;
    var i;
    for (i=0; i<max_wait; i++){
        run_status = await devicefarm.getRun({ arn: run.run.arn });

        if (run_status.run.status != "COMPLETED") {
            core.info("Run still executing, waiting: " + run_status.run.status);
            await sleep(wait_interval*1000);
        } else {
            break;
        }
    }

    if (i == max_wait){
        throw("Test run timed out. Consider increasing the 'timeout' (currently " + max_wait*wait_interval +"s) parameter.");
    }

    if (run_status.run.result == "PASSED") {
        core.info("Test run passed");
    } else {
        if (run_status.run.parsingResultUrl) {
            try {
                const download = await axios({
                    method: 'get',
                    url: run_status.run.parsingResultUrl
                });
                core.error(download.data);
            } catch (err) {
                throw("Unable to download parsing data for test run failed with "
                      + run_status.run.resultCode +
                     ", " + err);
            }
        }
    }

    run.downloaded_artifacts = await artifacts.getArtifact({file_artifacts: params.file_artifacts,
                                                            screenshot_artifacts: params.screenshot_artifacts,
                                                            log_artifacts: params.log_artifacts,
                                                            arn: run.run.arn});

    if (run_status.run.result != "PASSED") {
        throw("Test run failed after " + i*wait_interval + " seconds with: " + run_status.run.resultCode + ". Timeout is set to " + max_wait*wait_interval);
    }

    return run_status;
}
