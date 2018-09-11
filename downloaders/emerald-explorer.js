const shell = require('shelljs');
const Git = require("nodegit");
const path = require('path');

console.log('downloading and unpacking emerald-explorer please wait...');
const p = path.resolve(__dirname, '../emerald-tool');

Git.Clone('https://github.com/ETCDEVTeam/emerald-tool.git#fix/emerald-js-ui-material-one', p).then(() => {
  console.log('cloned');
  shell.cd(p);
  if (shell.exec('git checkout fix/emerald-js-ui-material-one').code !== 0) {
    throw new Error('Could not checkout specific branch');
  }
  const rootDir = path.resolve(__dirname, '../node_modules/.bin');

  if (shell.exec(`${rootDir}/lerna bootstrap`).code !== 0) {
    throw new Error('Could not lerna bootstrap');
  }

  if (shell.exec(`${rootDir}/lerna run build --scope emerald-tool-browser --include-filtered-dependencies --stream`).code !== 0) {
    throw new Error('Could not run yarn build:browser');
  }

  console.log('done cloning');
}).catch((e) => {
  console.log('error cloning', e);
});
