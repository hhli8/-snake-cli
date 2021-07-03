const child_process = require('child_process');
const chalk = require('chalk');

module.exports = function execSync(
  command,
  options = { cwd: process.cwd() },
  { hideCmd = false, hideOut = false } = {},
) {
  const { cwd } = options;

  if (!hideCmd) {
    console.log(chalk.cyan('➜', cwd), command);
  }
  const stdio = [0];
  if (!hideOut) {
    stdio.push(1, 2);
  }
  child_process.execSync(command, { stdio, ...options });
};
