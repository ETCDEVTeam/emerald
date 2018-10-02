const request = require('request');
const tar = require('tar');
const path = require('path');
const os = require('os');
const ora = require('ora');
const unzip = require('unzip');
const extract = tar.x({
  cwd: path.resolve(__dirname, '../')
});

const spinner = ora('sputnikvm-dev: Downloading and Unpacking');
spinner.start();

const platform = os.platform()

switch (platform) {
  case 'darwin': 
    return request('http://builds.etcdevteam.com/sputnikvm-dev/v0.2.x/svmdev-osx-v0.2.0-36-46a63e0.tar.gz').pipe(extract).on('end', () => spinner.succeed('sputnikvm-dev: finished installation'));
  case 'linux': 
    return request('http://builds.etcdevteam.com/sputnikvm-dev/v0.2.x/svmdev-linux-v0.2.0-36-46a63e0.tar.gz').pipe(extract).on('end', () => spinner.succeed('sputnikvm-dev: finished installation'));
  case 'win32': 
    return request('https://builds.etcdevteam.com/sputnikvm-dev/v0.2.x/sputnikvm-dev-v0.2.0-26-bd7111b-i686-pc-windows-msvc.zip').pipe(unzip.Extract({ path: path.resolve(__dirname, '../') })).on('end', () => spinner.succeed('sputnikvm-dev: finished installation'));

}
