const emeraldjs = require('emerald-js');
const util = require('ethereumjs-util');
const opn = require('opn');
const { JsonRpc, HttpTransport, Vault, EthRpc, VaultJsonRpcProvider} = require('emerald-js');

module.exports = {
  EmeraldDeployer: class EmeraldDeployer {
    constructor(artifact) {
      this.vault = new Vault(new VaultJsonRpcProvider(new JsonRpc(new HttpTransport('http://127.0.0.1:1920'))));
      this.ethRpc = new EthRpc(new JsonRpc(new HttpTransport('http://127.0.0.1:8545')));
      this.artifact = artifact;
      this.constructedTx = null;
    }

    async deploy() {
      // configure this somehow
      // configure this somehow
      const accounts = await this.vault.listAccounts('mainnet');
      const from = accounts[0].address;
      const nextNonce = await this.ethRpc.eth.getTransactionCount(from) + 1;
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
      const block = await this.ethRpc.eth.getBlock('latest', true);
      const isInLastBlock = block.transactions.find(tx => tx.to === this.constructedTx.to);
      console.log(isInLastBlock);
      setInterval(() => { this.waitUntilDeployed(); }, 3000);
    }

  }
};
