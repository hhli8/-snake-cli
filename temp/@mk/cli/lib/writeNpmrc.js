const fs = require('fs');
const path = require('path');

module.exports = function main(targetDir = process.cwd()) {
  const targetPath = path.resolve(targetDir, '.npmrc');
  fs.writeFileSync(
    targetPath,
    `registry=https://registry.npm.taobao.org/
@mk:registry=http://registry.npm.mockuai.com/
sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
  `,
  );
};
