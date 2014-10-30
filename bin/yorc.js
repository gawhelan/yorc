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
    conn.shell({pty: true}, function (err, stream) {
        if (err) {
            console.error(err);
            conn.end();
            process.exit(1);
            return;
        }

        stream.on('close', function () {
            conn.end();
        });

        process.stdin.setRawMode(true);
        process.stdin.setEncoding('utf8');
        process.stdin.pipe(stream);

        stream.stdout.pipe(process.stdout);
    });
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
