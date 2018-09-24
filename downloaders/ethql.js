const shell = require('shelljs');
const Git = require("nodegit");
const path = require('path');
const os = require('os');

console.log('downloading and unpacking ethql please wait...');
const p = path.resolve(__dirname, '../ethql');

Git.Clone('https://github.com/ConsenSys/ethql.git', p).then(() => {
  console.log('cloned');
  shell.cd(p);
  shell.exec('npm install yarn');
  shell.exec('./node_modules/.bin/yarn install');
  console.log('done cloning');
}).catch((e) => {
  console.log('error cloning', e);
});
