#!/usr/bin/env node

'use strict';

var Connection = require('ssh2');
var yaml = require('yamljs');

var argv = require('yargs')
    .require(1)
    .help('h').alias('h', 'help')
    .version(require('../package').version, 'v').alias('v', 'version')
    .usage('usage: $0 target')
    .argv;

var targetName = argv._[0];
var target;

function loadTarget(name) {
    return yaml.load(name + '.yaml');
}


if (!targetName) {
    console.error('Error: no target specified.');
    process.exit(1);
}

try {
    target = loadTarget(targetName);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.error('Error: could not find target file.\n' + err.message);
    } else {
        console.error('Error: could not parse target file.\n' + err.message);
        console.log(err.name);
    }

    process.exit(1);
}

var conn = new Connection();

conn.on('ready', function () {
    function handleNewStream(err, stream) {
        var stdin = process.stdin;

        if (err) {
            console.error(err);
            conn.end();
            process.exit(1);
            return;
        }

        stream.on('close', function () { conn.end(); });

        stdin.setEncoding('utf8');
        if (stdin.isTTY) {
            stdin.setRawMode(true);
        }
        stdin.pipe(stream);

        stream.stdout.pipe(process.stdout);
        stream.stderr.pipe(process.stderr);
    }

    if (process.stdin.isTTY) {
        conn.shell({pty: true}, handleNewStream);
    } else {
        conn.exec('sh -s', handleNewStream);
    }
});

conn.on('error', function (err) {
    console.error(err);
    process.exit(1);
});

conn.on('end', process.exit);

conn.connect({
    host: target.host,
    port: target.port,
    username: target.username,
    password: target.password,
    agent: process.env.SSH_AUTH_SOCK
});
