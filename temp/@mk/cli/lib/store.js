// const { execSync } = require('child_process');

// const $HOME = execSync('echo $HOME').toString().trim();
const $HOME = require('os').homedir();
const fs = require('fs');

const configFilePath = `${$HOME}/.mkrc`;

if (!fs.existsSync(configFilePath)) {
  fs.writeFileSync(configFilePath, '{}');
}

function getConfig() {
  return JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
}
function setConfig(config) {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
}

function get(key) {
  const config = getConfig();
  if (!key) return config;
  return config[key];
}
function set(key, value) {
  if (!key) throw new Error('key required');
  const config = getConfig();
  config[key] = value;
  setConfig(config);
  return true;
}

module.exports = { configFilePath, get, set };
