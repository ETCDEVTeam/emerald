const shell = require('shelljs');
const Git = require("nodegit");
const path = require('path');

console.log('downloading and unpacking emerald-wallet please wait...');
const p = path.resolve(__dirname, '../emerald-tool');

Git.Clone('https://github.com/ETCDEVTeam/emerald-tool.git#fix/emerald-js-ui-material-one', p).then(() => {
  console.log('cloned');
  shell.cd(p);
  shell.exec('git checkout fix/emerald-js-ui-material-one && lerna bootstrap && yarn build:browser');
  console.log('done cloning');
}).catch((e) => {
  console.log('error cloning', e);
});
