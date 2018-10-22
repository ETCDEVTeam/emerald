const request = require('request');
const tar = require('tar');
const path = require('path');
const shell = require('shelljs');
const os = require('os');
const ora = require('ora');
const unzip = require('unzip');
const p = path.resolve(__dirname, '../');
const extract = tar.x({
  cwd: p
});

const spinner = ora('emerald-vault: Downloading and Unpacking');
spinner.start();

const platform = os.platform()

switch (platform) {
  case 'darwin': 
    return request('http://builds.etcdevteam.com/emerald-cli/v0.22.x/emerald-cli-osx-v0.22.0+11-c210192.tar.gz')
      .pipe(extract)
      .on('end', () => {
        shell.mv(path.resolve(p, 'emerald'), path.resolve(p, 'emerald-vault'))
        spinner.succeed('emerald-vault: finished installation')
      });
  case 'linux': 
    return request('http://builds.etcdevteam.com/emerald-cli/v0.22.x/emerald-cli-linux-v0.22.0+11-c210192.tar.gz').pipe(extract).on('end', () => {
      shell.mv(path.resolve(p, 'emerald'), path.resolve(p, 'emerald-vault'))
      spinner.succeed('emerald-vault: finished installation')
    });
  case 'win32': 
    return request('http://builds.etcdevteam.com/emerald-cli/v0.22.x/emerald-stable-x86_64-pc-windows-msvc-v0.22.0+11-c210192.zip').pipe(unzip.Extract({ path: p })).on('end', () => {
      shell.mv(path.resolve(p, 'emerald.exe'), path.resolve(p, 'emerald-vault.exe'))
      spinner.succeed('emerald-vault: finished installation')
    });

}