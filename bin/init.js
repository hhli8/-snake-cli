#! /usr/bin/env node
const { program } = require('commander')
const inquirer = require('inquirer')
const config = require('./config')
const ora = require('ora')
const downloadGit = require('download-git-repo')
const chalk = require('chalk')
const { clone } = require('./download')

const spawn = async (...args) => {
  const {spawn} = require('child_process')
  return new Promise(resolve =>   {
      const proc = spawn (...args)
      proc.stdout.pipe(process.stdout)
      proc.stderr.pipe(process.stderr)
      proc.on('close', ()  =>  {
          resolve()
      })
  })
} 

program.usage('[project-name]')
       .description('init a new project')
       .action(async () => {
        let projectName = program.args[0]
        const ans = await inquirer.prompt([
          {
            type: 'list',
            name: 'templateUrl',
            message: '选择一个模板',
            choices: config.templates,
          }
        ])
        // const spinner = ora("Downloading...")
        // downloadGit(
        //   ans.templateUrl,
        //   projectName,
        //   err => {
        //     if (err) {
        //       spinner.fail()
        //       console.log(chalk.red(`Generation failed. ${err}`))
        //     } else {
        //       spinner.succeed()
        //       console.log(chalk.cyan('\n To get started'))
        //     }
        //   }
        // )
        await clone(ans.templateUrl, projectName)
        log('🛵 正在安装依赖中......')
        // await spawn('npm',['install'],{cwd:`./${projectName}`})
       })
       .parse(process.argv)



// const program = require('commander')
// const chalk = require('chalk')
// const ora = require('ora')
// const download = require('download-git-repo')
// const tplObj = require(`${__dirname}/../template`)

// program
//     .usage('<template-name> [project-name]')
// program.parse(process.argv)
// // 当没有输入参数的时候给个提示
// if (program.args.length < 1) return program.help()

// // 好比 vue init webpack project-name 的命令一样，第一个参数是 webpack，第二个参数是 project-name
// let templateName = program.args[0]
// let projectName = program.args[1]
// // 小小校验一下参数
// if (!tplObj[templateName]) {
//     console.log(chalk.red('\n Template does not exit! \n '))
//     return
// }
// if (!projectName) {
//     console.log(chalk.red('\n Project should not be empty! \n '))
//     return
// }

// url = tplObj[templateName]

// console.log(chalk.white('\n Start generating... \n'))
// // 出现加载图标
// const spinner = ora("Downloading...");
// spinner.start();
// // 执行下载方法并传入参数
// download(
//     url,
//     projectName,
//     err => {
//         if (err) {
//             spinner.fail();
//             console.log(chalk.red(`Generation failed. ${err}`))
//             return
//         }
//         // 结束加载图标
//         spinner.succeed();
//         console.log(chalk.cyan('\n Generation completed!'))
//         console.log(chalk.cyan('\n To get started'))
//         console.log(chalk.cyan(`\n    cd ${projectName} \n`))
//     }
// )

// console.log(123)

// const {promisify} = require ('util')
// const figlet = promisify(require('figlet'))

// const clear = require('clear')
// const chalk = require('chalk')
// const log = content => console.log(chalk.green(content))
// const {clone} = require('./download')
// const open = require('open')
// const { resolve } = require('path')
// const spawn = async (...args) => {
//     const {spawn} = require('child_process')
//     return new Promise(resolve =>   {
//         const proc = spawn (...args)
//         proc.stdout.pipe(process.stdout)
//         proc.stderr.pipe(process.stderr)
//         proc.on('close', ()  =>  {
//             resolve()
//         })
//     })
// }            

// module.exports = async name =>{
//     clear()
//     const data = await figlet ('MOCKUAI')
//     log(data)

//     // clone
//     log(`🛴 创建项目 ${name}`)
//     // await clone(`github:zwinds/vue-template`, name)
//     await clone(`github:hhli8/react17`, name)

//     //自动安装依赖
//     log('🛵 正在安装依赖中......')
//     await spawn('npm',['install'],{cwd:`./${name}`})
//     log(`
// 🥳  安装完成：

// 快去把项目跑起来吧~：

// =========================================
// cd ${name}

// npm run serve
// =========================================

//     `)
//     open(`http://localhost:8080`)
//     //启动浏览器
//     await spawn ('npm',['run','serve'],{cwd:`./${name}`})
// }