const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const devicefarm = require('./aws-devicefarm.js');
const axios = require('axios');
const sleep = require('sleep-promise');
const { finished } = require('stream');
const { promisify } = require('util');
const process = require('process');

exports.uploadFile = async function (params) {
    var max_wait_s = 600;
    // params.file may be a local file or a remote URL - in case of a URL it
    // needs to be rewritten later for local access while still keeping the
    // URL around. file_src will keep the original URL/location.
    const file_src = params.file;

    if (!params.name) {
        params.name = path.basename(params.file);
    }

    core.debug("Upload file CWD: " + process.cwd());

    if (!fs.existsSync(params.file)) {
        if (params.remote_src) {
            if (!fs.existsSync(params.name)) {
                try {
                    var write_stream = fs.createWriteStream(params.name);

                    const download = await axios({
                        method: 'get',
                        url: file_src,
                        responseType: 'stream'
                    });
                    const finishedAsync = promisify(finished);

                    download.data.pipe(write_stream);
                    // this will fail on larger fails without explicit waiting here
                    await finishedAsync(write_stream);

                } catch (err) {
                    throw("Unable to download remote file " + file_src + " to " + params.name + ", " + err);
                }
            } else {
                core.info("Skipping download of " + file_src + ", local file already exists in " + process.cwd());
            }
            params.file = params.name;
        } else {
            throw("Upload file " + params.file + " does not exist in " + process.cwd());
        }
    }

    var upload_params = {
        projectArn: params.projectArn,
        name: params.name,
        type: params.type
    }

    var upload = await devicefarm.createUpload(upload_params);
    core.info("Payload: " + upload.upload.arn);

    try {
        const url = upload.upload.url;
        const read_stream = fs.createReadStream(params.file);
        const {size} = fs.statSync(params.file);

        await axios({
            method: 'put',
            url: url,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                'Content-Length': size
            },
            data: read_stream
        })
    } catch (err) {
        throw("Unable to push content for upload " + params.file + ", " + err);
    }

    var upload_status;
    for (let i=0; i<max_wait_s/5; i++){
        upload_status = await devicefarm.getUpload({ arn: upload.upload.arn });

        if (upload_status.upload.status == "INITIALIZED") {
            core.info("File is still initializing, waiting");
            await sleep(5000);
        } else {
            break;
        }
    }

    if (upload_status.upload.status == "FAILED") {
        throw("Upload failed: " + upload_status.upload.status + " " + upload_status.upload.metadata);
    }

    return upload;
}
