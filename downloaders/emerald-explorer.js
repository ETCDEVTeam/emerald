const shell = require('shelljs');
const path = require('path');
const os = require('os');
const util = require('util');
const ora = require('ora');
const tmp = require('tmp');
const ghdownload = require('github-download')

const spinner = ora('emerald-explorer: Downloading and Unpacking');
const exec = util.promisify(shell.exec);

spinner.start();

const p = path.resolve(__dirname, '../emerald-explorer');

const options = { silent: true, async: true };


const download = async () => {
  const tmpobj = tmp.dirSync();
  console.log('tmp', tmpobj);

  try {
    await new Promise((resolve, reject) => {
      ghdownload({user: 'ETCDEVTeam', repo: 'emerald-explorer', ref: 'master'}, tmpobj.name)
        .on('err', (e) => {
          reject(e)
        })
        .on('end', () => {
          shell.mkdir('-p', p);
          shell.mv(`${tmpobj.name}/*`, p);
          resolve();
        });
    })
  } catch (e) {
    return spinner.fail('emerald-explorer: Could not checkout specific branch');
  }


  const rootDir = path.resolve(__dirname, '../node_modules/.bin');

  try {
    shell.cd(p);
    await exec(`${rootDir}/lerna bootstrap`, options);
  } catch (e) {
    return spinner.fail(`emerald-explorer: Could not lerna bootstrap ERROR: ${JSON.stringify(e)}`);
  }


  try {
    await exec(`${rootDir}/lerna run build --scope emerald-tool-browser --include-filtered-dependencies --stream`, options)
  } catch (e) {
    return spinner.fail('emerald-explorer: Could not run yarn build:browser');
  }

}

download().then(() => {
  spinner.succeed('emerald-explorer: finished installation');
});
