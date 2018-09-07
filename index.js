#!/usr/bin/env node
const prog = require('caporal');
const truffleBox = require('truffle-box');
const migrate = require('truffle-core/lib/commands/migrate');
const shell = require('shelljs');


prog
  .version('0.0.1')
  // you specify arguments using .argument()
  // 'app' is required, 'env' is optional
  .command('new', 'Create a new project')
  .action(async (args, options, logger) => {
    await truffleBox.unbox('https://github.com/BelfordZ/emerald-starter-kit.git', process.cwd(), {logger})
    logger.info('New Emerald project created');
  })
  //
  .command('wallet', 'Boot Emerald Wallet')
  .command('explorer', 'Boot Explorer')
  .command('testrpc', 'Run testnet for ethereum classic')
  .action((args, options, logger) => {
    if (shell.exec('./svmdev') !== 0) {
      logger.error('failed to launch testrpc')
    };
  })
  //
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
