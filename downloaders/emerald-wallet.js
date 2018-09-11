const shell = require('shelljs');
const Git = require("nodegit");
const path = require('path');

console.log('downloading and unpacking emerald-wallet please wait...');
const p = path.resolve(__dirname, '../emerald-wallet');

Git.Clone('https://github.com/ETCDEVTeam/emerald-wallet.git', p).then(() => {
  console.log('cloned');
  shell.cd(p);
  shell.exec('npm install');
  shell.exec('npm run dist');
  console.log('done cloning');
}).catch((e) => {
  console.log('error cloning', e);
});

