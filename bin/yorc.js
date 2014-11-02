#!/usr/bin/env node

'use strict';

var Connection = require('ssh2');
var yaml = require('yamljs');

var targetName = process.argv[2];
var target;

function loadTarget(name) {
    return yaml.load(name + '.yaml');
}


if (!targetName) {
    console.error('Error: no target specified.');
    process.exit(1);
}

target = loadTarget(targetName);

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
