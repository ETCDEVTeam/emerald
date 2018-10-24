const request = require('request');
const tar = require('tar');
const path = require('path');
const fs = require('fs');
const ora = require('ora');
const unzip = require('unzip');
const extract = tar.x({
  cwd: path.resolve(__dirname, '../')
});

const spinner = ora('solc: Downloading');
spinner.start();

const version = fs.readFileSync(path.resolve(__dirname, '../', '.solidity-version')).toString();

const file = fs.createWriteStream(path.resolve(__dirname, '../', 'solc.js')); 

const url = `https://ethereum.github.io/solc-bin/bin/soljson-${version}.js`;
request(url).pipe(file).on('finish', () => spinner.succeed('solc: finished installation'));