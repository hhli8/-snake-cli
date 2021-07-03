const fs = require('fs-extra');
const path = require('path');

module.exports = function copyFiles() {
  fs.copySync(path.resolve(__dirname, './files'), process.cwd());
};
