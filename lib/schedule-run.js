const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const devicefarm = require('./aws-devicefarm.js');
const axios = require('axios');
const sleep = require('sleep-promise');
const file_upload = require("../lib/upload-file.js");

exports.scheduleRun = async function (params) {
    var name = github.run_id;
    var max_wait_s = 1200;

    if (params.appArn && params.appFile) {
        core.setFailed("Only specify one of app_arn or app_file");
        return;
    }

    if (params.testSpecArn && params.testSpecFile) {
        core.setFailed("Only specify one of test_spec_arn or test_spec_file");
        return;
    }

    if (params.testPackageArn && params.testPackageFile) {
        core.setFailed("Only specify one of test_package_arn or test_package_file");
        return;
    }

    if (params.name) {
        name = params.name;
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

    var run_params = {
        appArn: params.appArn,
        name: name,
        devicePoolArn: params.devicePoolArn,
        projectArn: params.projectArn,
        test: {
            type: params.testType,
            testPackageArn: params.testPackageArn,
            testSpecArn: params.testSpecArn
        }
    }

    var run = await devicefarm.scheduleRun(run_params);

    var run_status;
    for (let i=0; i<max_wait_s/5; i++){
        run_status = await devicefarm.getRun({ arn: run.run.arn });

        if (run_status.run.status != "COMPLETED") {
            core.info("Run still executing, waiting: " + run_status.run.status);
            await sleep(5000);
        } else {
            break;
        }
    }

    if (run_status.run.result == "PASSED") {
        core.info("Test run passed");
    } else {
        throw("Test run failed: " + run_status.run.resultCode);
    }

    return run;
}
