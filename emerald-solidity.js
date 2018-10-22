const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
let solc = require('solc');

function getFiles() {
  const files = fs.readdirSync(path.resolve(process.cwd(), 'contracts'));
  return files.map((file) => {
    const p = path.resolve(process.cwd(), 'contracts', file);
    return {
      path: p,
      contractName: file.split('.sol')[0],
      source: fs.readFileSync(p).toString()
    }
  });
}

const reducer = (memo, {path, source}) => {
  memo[path] = source;
  return memo;
}

const version = fs.readFileSync(path.resolve(__dirname, '.solidity-version')).toString();

module.exports = () => {
  solc = solc.setupMethods(require('./solc'));
  const files = getFiles();

  const input = {
    sources: files.reduce(reducer, {}),
    settings: {
      evmVersion: "spuriousDragon"
    }
  };

  const output = solc.compile(input, 1);

  if (output.errors && output.errors.length > 0) {
    return console.log('ERROR: \n', output.errors);
  }

  const keys = Object.keys(output.contracts);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const outputItem = output.contracts[key];
    const fileInput = files.find((file) => {
      return file.path === key.split(':')[0];
    });
    const contractName = fileInput.contractName;
    const p = path.resolve(process.cwd(), 'build/contracts/', `${contractName}.json`);
    // try to be compatible with truffle-contract-schema spec: https://github.com/trufflesuite/truffle/blob/next/packages/truffle-contract-schema/spec/contract-object.spec.json
    const artifact = {
      contractName: fileInput.contractName,
      abi: outputItem.interface,
      bytecode: outputItem.bytecode,
      deployedBytecode: outputItem.runtimeBytecode,
      sourceMap: outputItem.srcmap,
      deployedSourceMap: outputItem.srcmapRuntime,
      source: fileInput.source,
      sourcePath: fileInput.path,
      ast: output.sources[fileInput.path].AST,
      compiler: {
        name: "solc",
        version
      },
      networks: {},
      updatedAt: new Date().toISOString()
    };
    shell.mkdir('-p', path.resolve(process.cwd(), 'build/contracts'));
    fs.writeFileSync(p, JSON.stringify(artifact, null, 2), 'utf8');
  };

}
