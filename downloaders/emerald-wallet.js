const request = require('request');
const fs = require('fs');
const file = fs.createWriteStream('EmeraldWallet.dmg');
const shell = require('shelljs');
const dmg = require('dmg');

console.log('downloading and unpacking emerald-wallet please wait...');

request('https://github.com/ETCDEVTeam/emerald-wallet/releases/download/v1.0.0/EmeraldWallet-mac-v1.0.0-62c64d5.dmg')
  .pipe(file)
  .on('finish', () => {
    const myDmg = process.cwd() + '/EmeraldWallet.dmg';

    dmg.mount(myDmg, (err, path) => {
      shell.cp('-R', `${path}/EmeraldWallet.app`, process.cwd() + '/EmeraldWallet.app')
      dmg.unmount(path, (err) => {
        console.log(err, 'unmounted');
      })
    });
  });

