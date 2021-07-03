const execa = require('execa');
const semver = require('semver');
// const chalk = require('chalk');
// const { execSync } = require('child_process');
const execAsync = require('./execAsync');
const packageInfo = require('../package.json');
const store = require('./store');

// const INTERVAL = 1000;
const INTERVAL = 1000 * 60 * 60 * 24;
const KEY = 'lastCheck';

function shouldCheck() {
  return Date.now() - (store.get(KEY) || 0) > INTERVAL;
}
async function update() {
  console.log('Updating...');
  await execAsync(`npm i -g ${packageInfo.name}`, undefined, { hideCmd: true, hideOut: true });
  await execAsync(process.argv.join(' '), undefined, { hideCmd: true });
  process.exit(1);
}

function main() {
  if (!shouldCheck()) return;
  console.log('Checking new version...');
  const subprocess = execa.command(`npm view ${packageInfo.name} version`, {
    timeout: 5000,
  });

  return subprocess
    .then(({ stdout: latestVersion }) => {
      store.set(KEY, Date.now());
      if (semver.gt(latestVersion, packageInfo.version)) {
        // latestHigherVersion = latestVersion;
        return update();
        // return latestVersion;
      }
      return null;
    })
    .catch((err) => {
      if (err.timedOut) {
        console.log('Time out, cancelled');
        return null;
      }
      throw err;
    });
}
module.exports = main;
