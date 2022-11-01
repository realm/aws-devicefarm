const core = require('@actions/core');
const github = require('@actions/github');
const devicefarm = require('./aws-devicefarm.js');

async function pullArtifacts (params) {
    var artifact_list = await devicefarm.listArtifacts({arn: params.arn,
                                                        type: params.type});

    var downloaded_files = [];
    // TODO: return two json structures, all available artifacts, all downloaded artifacts
    var artifacts = {};
    artifact_list.artifacts.forEach(function(artifact) {
        var name = artifact.name + "." + artifact.extension;
        var _a = {
            type: artifact.type,
            url: artifact.url,
            arn: artifact.arn
        };
        artifacts[name] = _a;
        core.debug("Adding " + name + " of type " + _a.type + " to available artifacts");
    });

    params.files.forEach(function(file) {
        if (artifacts[file]) {
            core.debug("Pulling artifact " + file);
            devicefarm.getUrl({url: artifacts[file].url,
                               output_file: file});
            downloaded_files.push(file);
        } else {
            core.warning("No matching artifact of type " + params.type + " found for " + file + ", skipping");
        }
    });

    return downloaded_files;
}

exports.getArtifact = async function (params) {
    var downloaded_files = {};
    if (params.file_artifacts) {
        downloaded_files.FILE = await pullArtifacts({arn: params.arn,
                                                     files: params.file_artifacts,
                                                     type: "FILE"});
    }
    if (params.screenshot_artifacts) {
        downloaded_files.SCREENSHOT = await pullArtifacts({arn: params.arn,
                                                           files: params.screenshot_artifacts,
                                                           type: "SCREENSHOT"});
    }
    if (params.log_artifacts) {
        downloaded_files.LOG = await pullArtifacts({arn: params.arn,
                                                    files: params.log_artifacts,
                                                    type: "LOG"});
    }

    return downloaded_files;
}
