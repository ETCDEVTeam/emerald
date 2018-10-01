#!/usr/bin/env node
const prog = require('caporal');
const truffleBox = require('truffle-box');
const migrate = require('truffle-core/lib/commands/migrate');
const shell = require('shelljs');
const os = require('os');
const opn = require('opn');

const platform = os.platform();
prog
  .version('0.0.1')

  .command('new', 'Create a new project')
  .action(async (args, options, logger) => {
    const dir = (args.length > 0) ? args[0] : process.cwd();
    await truffleBox.unbox('https://github.com/ETCDEVTeam/emerald-starter-kit.git', dir, {logger})
    logger.info('New Emerald project created');
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

  .command('testrpc', 'Run testnet for ethereum classic')
  .action((args, options, logger) => {
    switch (platform) {
      case 'darwin':
      case 'linux':
        if (shell.exec(`${__dirname}/svmdev`) !== 0) {
          logger.error('failed to launch testrpc')
        };
      case 'win32':
        if (shell.exec(`${__dirname}/svmdev.exe`) !== 0) {
          logger.error('failed to launch testrpc')
        };
    }
  })

  .command('deploy', 'Deploy solidity to network')
  .action((args, options, logger) => {
    migrate.run({working_directory: process.cwd()}, (err) => {
      if (err) {
        return logger.error(err);
      }
      logger.info('migrated');
    });
  })

prog.parse(process.argv);
