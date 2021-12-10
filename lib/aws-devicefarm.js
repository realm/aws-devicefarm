const core = require('@actions/core');
const fs = require('fs');

const aws = require('aws-sdk');
var devicefarm = new aws.DeviceFarm();


exports.getUrl = async function (params) {
    const axios = require('axios');
    const { finished } = require('stream');
    const { promisify } = require('util');

    try {
        var write_stream = fs.createWriteStream(params.output_file);

        const download = await axios({
            method: 'get',
            url: params.url,
            responseType: 'stream'
        });
        const finishedAsync = promisify(finished);

        download.data.pipe(write_stream);
        // this will fail on larger fails without explicit waiting here
        return await finishedAsync(write_stream);
    } catch (err) {
        throw("Downloading " + params.url + " to " + params.output_file + " failed: " + err);
    }
}

exports.validateParameters = function (params, expected) {
    var missing_parameters = [];

    for (const [key, value] of Object.entries(expected)) {
        if (!params[key]) {
            if (value) {
                missing_parameters.push(value);
            } else {
                missing_parameters.push(key);
            }
        }
    }

    if (missing_parameters.length != 0) {
        core.setFailed("Mandatory parameters missing: " + missing_parameters.join(", "));
        return false;
    }

    return true;
}

// the following are just simple wrappers around the AWS API methods. This also
// could've been done in place using util.promisify, but having a central
// wrapper instead allows us nicer error checking and error reporting to the
// actions API, if necessary.

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#createUpload-property
exports.createUpload = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.createUpload(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#deleteUpload-property
exports.deleteUpload = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.deleteUpload(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#getDevicePool-property
exports.getDevicePool = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.getDevicePool(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#getProject-property
exports.getProject = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.getProject(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#getRun-property
exports.getRun = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.getRun(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#getUpload-property
exports.getUpload = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.getUpload(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#listArtifacts-property
exports.listArtifacts = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.listArtifacts(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#listDevicePools-property
exports.listDevicePools = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.listDevicePools(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#listRuns-property
exports.listRuns = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.listRuns(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#listUploads-property
exports.listUploads = function (params) {
    if (!params.arn){
        return new Promise((resolve, reject) => {
            return reject("Parameter arn is mandatory")
        })
    }

    return new Promise((resolve, reject) => {
        devicefarm.listUploads(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DeviceFarm.html#scheduleRun-property
exports.scheduleRun = function (params) {
    return new Promise((resolve, reject) => {
        devicefarm.scheduleRun(params, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}
