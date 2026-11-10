#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const nextBin = path.join(__dirname, '../node_modules/.bin/next');
const args = process.argv.slice(2);
const buildArgs = args.includes('build') ? ['build'] : args;

const res = spawnSync(nextBin, buildArgs, { stdio: 'inherit' });
process.exit(res.status || 0);
