const fs = require('fs');
/**
 * @function 检查是否为根目录
 */
function main() {
  const hasPkgJson = fs.existsSync(process.cwd() + '/package.json');
  if (hasPkgJson) {
    return true;
  }
  throw Error('请在项目根目录下执行');
}

main()
