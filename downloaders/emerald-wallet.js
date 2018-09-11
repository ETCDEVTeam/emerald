const shell = require('shelljs');
const Git = require("nodegit");

console.log('downloading and unpacking emerald-wallet please wait...');

Git.Clone('https://github.com/ETCDEVTeam/emerald-wallet.git', `${__dirname}/emerald-wallet`).then(() => {
  console.log('cloned');
  shell.cd(`${__dirname}/emerald-wallet`);
  shell.exec('npm install');
  shell.exec('npm run dist');
  console.log('done cloning');
}).catch((e) => {
  console.log('error cloning', e);
});

