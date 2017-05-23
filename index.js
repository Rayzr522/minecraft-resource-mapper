const path = require('path');
const fs = require('fs');

function log(message) {
    console.log(message);
}

log.error = function (message) {
    log('[ERROR] ' + message);
}

function exists(file) {
    return fs.existsSync(file);
}

function mkdirp(folder) {
    const pathsToMake = [];
    let current = folder;

    while (!fs.existsSync(current)) {
        pathsToMake.push(current);
        current = path.dirname(current);
    }

    pathsToMake.reverse().forEach(item => {
        fs.mkdirSync(item);
    });
}

const buffer = Buffer.allocUnsafe(64 * 1024);
function copy(src, dest) {
    log(src);
    log(dest);

    if (!fs.existsSync(path.dirname(dest))) {
        mkdirp(path.dirname(dest));
    }

    const fdr = fs.openSync(src, 'r');
    const stat = fs.fstatSync(fdr);
    const fdw = fs.openSync(dest, 'w', stat.mode);

    let bytesRead = 1;
    let pos = 0;

    while (bytesRead > 0) {
        bytesRead = fs.readSync(fdr, buffer, 0, 64 * 1024, pos);
        fs.writeSync(fdw, buffer, 0, bytesRead);
        pos += bytesRead;
    }

    fs.futimesSync(fdw, stat.atime, stat.mtime);

    fs.closeSync(fdr);
    fs.closeSync(fdw);
}


/**
 * Maps all Minecraft resources from their hashed names to the original file structure.
 * 
 * @param {string} indexPath Path to the JSON index file
 * @param {string} objectsPath Path to the objects folder
 */
function mapResources(indexPath, objectsPath) {
    if (!indexPath.endsWith('.json') || !fs.statSync(indexPath).isFile()) {
        throw 'The index file must be a JSON file.';
    }

    if (!fs.statSync(objectsPath).isDirectory()) {
        throw 'The objects folder must be a directory.';
    }

    let index;
    try {
        index = require(indexPath);
    } catch (err) {
        throw 'Failed to load index file:\n' + err;
    }

    if (typeof index.objects !== 'object') {
        throw 'Could not find data in index file.';
    }

    const objects = index.objects;

    Object.keys(objects).forEach(key => {
        const fileName = objects[key].hash;
        const hashFolder = fileName.substr(0, 2);

        const oldPath = path.resolve(objectsPath, hashFolder, fileName);
        if (!exists(oldPath)) {
            throw `The file ${oldPath} could not be found!`;
        }

        const newPath = path.resolve('.', 'output', key);
        if (exists(newPath)) {
            throw `${newPath} already exists!`;
        }

        copy(oldPath, newPath);
    });
}

module.exports = mapResources;