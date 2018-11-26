#!/usr/bin/env node
const prog = require('caporal');
const path = require('path');
const rimraf = require('rimraf');
const migrate = require('truffle-core/lib/commands/migrate');
const shell = require('shelljs');
const os = require('os');
const compileSolidityCwd = require('./emerald-solidity');
const ora = require('ora');
const opn = require('opn');
const tmp = require('tmp');
const EmeraldJs = require('emerald-js');
const Wallet = EmeraldJs.Wallet;
const ghdownload = require('github-download')
const { JsonRpc, HttpTransport, Vault, VaultJsonRpcProvider } = require('emerald-js');
const platform = os.platform();
const { EmeraldDeployer } = require('./emerald-contract');

const {eachSeries} = require('async');

const {promisify} = require('util');
const _fs = require('fs');
const fs = {
  readFile: promisify(_fs.readFile)
};

const commands = {
  vault() {
    let e;
    switch (platform) {
      case 'darwin':
      case 'linux':
        e = shell.exec(`${__dirname}/emerald-vault server`, {async: true});
        break
      case 'win32':
        e = shell.exec(`${__dirname}/emerald-vault.exe server`, {async: true})
        break
    }
    return e;
  }
}

prog
  .version('0.0.2')

  .command('new', 'Create a new project')
  .action((args, options, logger) => {
    const spinner = ora('Creating new project');
    spinner.start();
    return new Promise((resolve, reject) => {
      const tmpobj = tmp.dirSync();
      ghdownload({user: 'ETCDEVTeam', repo: 'emerald-starter-kit', ref: 'master'}, tmpobj.name)
        .on('err', (e) => {
          logger.debug('err', e)
          spinner.fail('failed to create ${JSON.stringify(e)}');
        })
        .on('end', () => {
          spinner.succeed('New Emerald project created');
          shell.mv(`${tmpobj.name}/*`, './');
          resolve();
        });
    });
  })

  .command('vault', 'Run emerald vault')
  .action((args, options, logger) => {
    return commands.vault();
  })

  .command('testrpc', 'Run testnet for ethereum classic')
  .argument('[passphrase]', 'passphrase to use for adding private keys to vault')
  .action((args, options, logger) => {
    let e;
    switch (platform) {
      case 'darwin':
      case 'linux':
        e = shell.exec(`${__dirname}/svmdev`, {async: true});
        break
      case 'win32':
        e = shell.exec(`${__dirname}/svmdev.exe`, {async: true})
        break
    }
    e.stdout.once('data', function(data) {
      const lines = data.split('\n');
      const group = lines.map((line, i) => {
        if (i % 2 === 0) {
          return
        } else {
          const address = lines[i - 1].split('address: ')[1];
          const privateKey = lines[i].split('private key: ')[1];
          logger.debug('before: import private key to vault:', privateKey);
          const keyfile = Wallet.fromPrivateKey(privateKey).toV3String(args.passphrase || "");
          const keyfileData = Object.assign(JSON.parse(keyfile), {
            name: 'emerald-testrpc',
            description: 'a test account for emerald testrpc'
          })
          return {
            address, privateKey, keyfileData
          }
        }
      }).filter(i => i);
      const vault = new Vault(new VaultJsonRpcProvider(new JsonRpc(new HttpTransport('http://127.0.0.1:1920'))));
      const promises = group.map(({keyfileData}) => {
        return vault.importAccount(keyfileData, 'mainnet');
      });
      Promise.all(promises).catch((e) => {
        logger.debug('error importing wallets to emerald-vault', e);
      })
    });
  })

  .command('wallet', 'Boot Emerald Wallet')
  .action((args, options, logger) => {
    switch (platform) {
      case 'darwin':
        return shell.exec(`open ${__dirname}/EmeraldWallet.app`);
      case 'linux':
        return shell.exec(`${__dirname}/EmeraldWallet.AppImage`);
      case 'win32':
        return shell.exec(`${__dirname}/EmeraldWallet.exe`);
    }
  })

  .command('explorer', 'Boot Explorer')
  .action((args, options, logger) => {
    shell.cd(`${__dirname}/emerald-explorer`);
    shell.exec(`${__dirname}/node_modules/.bin/lerna run --stream start --scope emerald-tool-browser --include-filtered-dependencies`);
    opn('http://localhost:3000/blocks');
  })

  .command('compile', 'Compile solidity')
  .action((args, options, logger) => {
    const p = path.resolve(process.cwd(), 'build/contracts');
    rimraf(`${p}/*`, (err) => {
      compileSolidityCwd();
    });
  })

  .command('deploy', 'Deploy solidity to network')
  .action((args, options, logger) => {
    const files = shell.ls(`${process.cwd()}/build/contracts/**/*.json`).concat([]);

    eachSeries(files, async (file) => {
      const artifactFile = await fs.readFile(file, 'utf8');
      const artifact = JSON.parse(artifactFile);
      const deployer = new EmeraldDeployer(artifact);
      try {
        const result = await deployer.deploy();
        const block = await deployer.waitUntilDeployed();
        console.log('deployed!');
        return;
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    }, (err) => {
      console.log('done');

      if (err) {
        console.error(err);
      }

      process.exit(0);
    });
  })

prog.parse(process.argv);
