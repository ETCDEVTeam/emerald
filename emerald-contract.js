const emeraldjs = require('emerald-js');
const util = require('ethereumjs-util');
const opn = require('opn');
const { until } = require('async');
const { JsonRpc, HttpTransport, Vault, EthRpc, VaultJsonRpcProvider} = require('emerald-js');

const vault = new Vault(new VaultJsonRpcProvider(new JsonRpc(new HttpTransport('http://127.0.0.1:1920'))));
const eth = new EthRpc(new JsonRpc(new HttpTransport('http://127.0.0.1:8545'))).eth;

const onNewBlock = async (lastBlockNumber) => {
  const block = await eth.getBlock('latest', true);

  if (lastBlockNumber === undefined) {
    lastBlockNumber = block.blockNumber;
  }

  if (lastBlockNumber === block.number) {
    console.log('ceiangiang');
    return new Promise((resolve) => {
      console.log('figgtiy');
      setTimeout(async () => resolve(await onNewBlock(lastBlockNumber)), 2000);
    });
  }

  return block;
};

module.exports = {
  EmeraldDeployer: class EmeraldDeployer {
    constructor(artifact) {
      this.artifact = artifact;
      this.constructedTx = null;
    }

    async deploy() {
      // configure this somehow
      // configure this somehow
      const accounts = await vault.listAccounts('mainnet');
      const from = accounts[0].address;
      const nextNonce = await eth.getTransactionCount(from) + 1;
      const tx = {
        to: '0x' + util.bufferToHex(util.rlphash([from, nextNonce])).slice(26),
        from,
        method: 'constructor',
        params: [123],
        contractBytecode: this.artifact.bytecode
      };

      this.constructedTx = tx;

      const txUri = new emeraldjs.TransactionUri(tx, this.artifact.abi);

      opn(txUri.toString())
        .then(() => {})
        .catch((e) => { console.error(e); });
    }

    async waitUntilDeployed() {
      return new Promise((resolve, reject) => {
        let block;
        until(
          () => block && block.transactions.find(tx => tx.to === this.constructedTx.to),
          async () => block = await onNewBlock(),
          (err, result) => {
            if (err) { reject(err); }
            else { resolve(block); }
          }
        );
      });
    }
  }
};
