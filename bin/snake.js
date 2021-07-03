#!/usr/bin/env node
const { program } = require('commander')

program.version(require('../package').version)
       .usage('<command> [options]')
       .command('init', 'generate a new project from a template', { executableFile: 'init', isDefault: false })
       .parse(process.argv)

// *********
// const { Command } = require('commander');
// const packageInfo = require('../package.json');
// async function main() {
//   // await checkNewVersion();

//   const mk = new Command('mk');

//   mk.name('mk')
//     .usage('<command> [options]')
//     .version(packageInfo.version, '-v, --version')
//     .command('init', '新建项目', { executableFile: 'init', isDefault: false })
//     .command('gen', '新建模块/页面', { executableFile: 'gen', isDefault: false })
//     .command('init-lint', '初始化lint', { executableFile: 'init-lint', isDefault: false })
//     .command('up-micro', '升级微前端', { executableFile: 'up-micro', isDefault: false })
//     .command('fix-routes', '修复路由动态import语法', { executableFile: 'fix-routes', isDefault: false })
//     // .exitOverride((error) => {
//     // checkNewVersion().then(console.log);
//     // })
//     .parse(process.argv);
// }

// *********

// program
//   .version(require('../package').version)
//   .usage('<command> [options]')
//   .command('add', 'add a new template')
//   .command('delete', 'delete a template')
//   .command('list', 'list all the templates')
//   .command('init', 'generate a new project from a template')
  
// // 解析命令行参数
// program.parse(process.argv)

// ***********


// const program = require('commander')
// program.version(require('../package.json').version)

// program 
//     .command('init <name>')
//     .description('init project ')
//     .action(require('../lib/init'))

// program.parse(process.argv)

// ******
// const { program } = require('commander');
// or
// const { Command } = require('commander');
// const program = new Command();