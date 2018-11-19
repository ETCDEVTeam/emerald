const { TransactionUri } = require('emerald-js');
const util = require('ethereumjs-util');
const opn = require('opn');

module.exports = {
  EmeraldDeployer: class EmeraldDeployer {
    constructor(artifact) {
      this.artifact = artifact;
    }

    deploy() {
      console.log(Object.keys(this.artifact));
      console.log(this.artifact.deployedBytecode);

      // byte code is the data section of the tx
      console.log(this.artifact.bytecode);

      const randomGasPrice = 4700000;

      const from = '0x556bac12f6a272714333665c04bf468833fafcd3';
      const tx = {
        to: '0x' + util.bufferToHex(util.rlphash([from, 5])).slice(26),
        from,
        gas: '3000000',
        method: 'constructor',
        params: [123],
        contractBytecode: this.artifact.bytecode
      };

      const txUri = new TransactionUri(tx, this.artifact.abi);

      console.log(txUri.toString());
      opn(txUri.toString())
        .then(() => {})
        .catch((e) => { console.error(e); });
    }
  }
};
