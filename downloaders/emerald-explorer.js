const shell = require('shelljs');
const Git = require("nodegit");
const path = require('path');
const os = require('os');
const ora = require('ora');

const spinner = ora('Downloading and Unpacking emerald-explorer');

spinner.start();

const p = path.resolve(__dirname, '../emerald-explorer');

Git.Clone('https://github.com/ETCDEVTeam/emerald-explorer.git#fix/emerald-js-ui-material-one', p).then(() => {
  shell.cd(p);
  if (shell.exec('git checkout fix/emerald-js-ui-material-one').code !== 0) {
    return spinner.fail('Could not checkout specific branch');
  }
  const rootDir = path.resolve(__dirname, '../node_modules/.bin');

  if (shell.exec(`${rootDir}/lerna bootstrap`).code !== 0) {
    return spinner.fail('Could not lerna bootstrap');
  }

  if (shell.exec(`${rootDir}/lerna run build --scope emerald-tool-browser --include-filtered-dependencies --stream`).code !== 0) {
    return spinner.fail('Could not run yarn build:browser');
  }

  spinner.succeed('finished downloading emerald-explorer')
}).catch((e) => {
  spinner.fail(`error cloning ${JSON.stringify(e)}`);
});
