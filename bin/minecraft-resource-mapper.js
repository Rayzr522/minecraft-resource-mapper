#!/usr/bin/env /usr/local/bin/node

(function main(args) {
    if (args.length < 2) {
        usage();
        throw 'You must provide an index file and an objects folder.';
    }

    const indexPath = args[0];
    const objectsPath = args[1];

    require('..')(indexPath, objectsPath);
})(process.argv.slice(2))