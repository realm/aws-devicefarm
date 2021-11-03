const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const devicefarm = require('./aws-devicefarm.js');
const axios = require('axios');
const sleep = require('sleep-promise');
const { finished } = require('stream');
const { promisify } = require('util');


exports.uploadFile = async function (params) {
    var name;
    var file = params.file;
    var max_wait_s = 600;

    if (params.name) {
        name = params.name;
    } else {
        name = path.basename(params.file)
    }

    if (params.remote_src) {
        file = name;

        try {
            var write_stream = fs.createWriteStream(name);

            const download = await axios({
                method: 'get',
                url: params.file,
                responseType: 'stream'
            });
            const finishedAsync = promisify(finished);

            download.data.pipe(write_stream);
            // this will fail on larger fails without explicit waiting here
            await finishedAsync(write_stream);
        } catch (err) {
            throw("Unable to download remote file " + file + ", " + err);
        }
    }

    if (!fs.existsSync(file)) {
        throw("Upload file does not exist: " + file);
    }

    var upload_params = {
        projectArn: params.projectArn,
        name: name,
        type: params.type
    }

    var upload = await devicefarm.createUpload(upload_params);
    core.info("Payload: " + upload.upload.arn);

    try {
        const url = upload.upload.url;
        const read_stream = fs.createReadStream(file);
        const {size} = fs.statSync(file);

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
        throw("Unable to push content for upload " + file + ", " + err);
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
