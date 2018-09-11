#!/usr/bin/env node
const prog = require('caporal');
const truffleBox = require('truffle-box');
const migrate = require('truffle-core/lib/commands/migrate');
const shell = require('shelljs');

prog
  .version('0.0.1')

  .command('new', 'Create a new project')
  .action(async (args, options, logger) => {
    const dir = (args.length > 0) ? args[0] : process.cwd();
    await truffleBox.unbox('https://github.com/BelfordZ/emerald-starter-kit.git', dir, {logger})
    logger.info('New Emerald project created');
  })

  .command('wallet', 'Boot Emerald Wallet')
  .action((args, options, logger) => {
    shell.exec(`open ${__dirname}/emerald-wallet/dist/mac/EmeraldWallet.app`);
  })

  .command('explorer', 'Boot Explorer')
  .action((args, options, logger) => {
    shell.cd(`${__dirname}/emerald-tool`);
    shell.exec(`${__dirname}/node_modules/.bin/yarn start:browser`);
    if (shell.exec('open http://localhost:3000/blocks') !== 0) {
      logger.error('failed to launch explorer')
    };
  })

  .command('testrpc', 'Run testnet for ethereum classic')
  .action((args, options, logger) => {
    if (shell.exec(`${__dirname}/svmdev`) !== 0) {
      logger.error('failed to launch testrpc')
    };
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
