const shell = require('shelljs');
const Git = require("nodegit");
const path = require('path');
const os = require('os');
const util = require('util');
const ora = require('ora');

const spinner = ora('emerald-explorer: Downloading and Unpacking');
const exec = util.promisify(shell.exec);

spinner.start();

const p = path.resolve(__dirname, '../emerald-explorer');

const options = { silent: true, async: true };

const download = async () => {
  try {
    await Git.Clone('https://github.com/ETCDEVTeam/emerald-explorer.git#fix/emerald-js-ui-material-one', p);
  } catch (e) {
    spinner.fail('emerald-explorer: error cloning ETCDEVTeam/emerald-explorer');
  }

  try {
    shell.cd(p);
    await exec('git checkout fix/emerald-js-ui-material-one', options);
  } catch (e) {
    return spinner.fail('emerald-explorer: Could not checkout specific branch');
  }


  const rootDir = path.resolve(__dirname, '../node_modules/.bin');

  try {
    await exec(`${rootDir}/lerna bootstrap`, options);
  } catch (e) {
    return spinner.fail('emerald-explorer: Could not lerna bootstrap');
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
