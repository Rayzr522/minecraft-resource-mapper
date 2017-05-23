#!/usr/bin/env /usr/local/bin/node

function usage() {
    console.log('Usage: minecraft-resource-mapper <index file> <objects folder>');
    process.exit(1);
}

(function main(args) {
    if (args.length < 2) {
        usage();
        process.exit(1);
    }

    const indexPath = args[0];
    const objectsPath = args[1];

    require('..')(indexPath, objectsPath);
})(process.argv.slice(2))