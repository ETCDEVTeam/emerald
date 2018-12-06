const util = require('ethereumjs-util');
const opn = require('opn');
const { until } = require('async');
const { TransactionUri, NodeChecker, JsonRpc, HttpTransport, Vault, EthRpc, VaultJsonRpcProvider} = require('emerald-js');

const vault = new Vault(new VaultJsonRpcProvider(new JsonRpc(new HttpTransport('http://127.0.0.1:1920'))));
const ethRpc = new EthRpc(new JsonRpc(new HttpTransport('http://127.0.0.1:8545')));
const eth = ethRpc.eth;
const checker = new NodeChecker(ethRpc);
const onNewBlock = async (lastBlockNumber) => {
  const block = await eth.getBlock('latest', true);

  if (lastBlockNumber === undefined) {
    lastBlockNumber = block.number;
  }

  if (lastBlockNumber === block.number) {
    return new Promise((resolve) => {
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
      let { chain, chainId } = await checker.getChain();

      if (chain === 'unknown') {
        chain = 'mainnet';
      }

      this.chain = chain;
      this.chainId = await ethRpc.net.version();

      const accounts = await vault.listAccounts(chain);
      const from = accounts[0].address;
      const nextNonce = await eth.getTransactionCount(from) + 1;
      const tx = {
        to: '0',
        from,
        mode: 'contract_constructor',
        gas: 6000000,
        data: this.artifact.bytecode
      };

      this.constructedTx = tx;

      const txUri = new TransactionUri(tx, this.artifact.abi);

      opn(txUri.toString())
        .then(() => {})
        .catch((e) => { console.error(e); });
    }

    async store() {
      vault.importContract(this.constructedTx.to, this.artifact.contractName, this.artifact.abi, this.chainId);
    }

    async waitUntilDeployed() {
      return new Promise((resolve, reject) => {
        let block;
        until(
          () => block && block.transactions.find(tx => tx.to === this.constructedTx.to),
          async () => block = await onNewBlock(),
          (err, result) => {
            if (err) { reject(err); }
            else { resolve(block.transactions.find(tx => tx.to === this.constructedTx.to)); }
          }
        );
      });
    }
  }
};
