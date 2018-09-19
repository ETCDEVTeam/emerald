const request = require('request');
const tar = require('tar');
const path = require('path');
const os = require('os');
const extract = tar.x({
  cwd: path.resolve(__dirname, '../')
});

console.log('downloading and unpacking sputnikvm-dev please wait...');
const platform = os.platform()

switch (platform) {
    case 'darwin': 
      return request('http://builds.etcdevteam.com/sputnikvm-dev/v0.2.x/svmdev-osx-v0.2.0-36-46a63e0.tar.gz').pipe(extract);
    case 'linux': 
      return request('http://builds.etcdevteam.com/sputnikvm-dev/v0.2.x/svmdev-linux-v0.2.0-36-46a63e0.tar.gz').pipe(extract);
}
