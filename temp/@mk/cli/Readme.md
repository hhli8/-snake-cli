# @mk/cli

我们不是@vue/cli的竞品，我们不是webpack的封装方案，我们是解决一系列工程问题的工具集合。

## Install
```bash
npm i -g @mk/cli
```

## Usage
```
Usage: mk <command> [options]

Options:
  -v, --version   output the version number
  -h, --help      display help for command

Commands:
  init            新建项目
  gen             新建模块/页面
  init-lint       初始化lint
  up-micro        升级微前端
  help [command]  display help for command
```

## TODO
 - [x] 老项目添加lint
 - [x] 微前端一键升级
 - [x] 拉取模板仓库以创建新项目
 - [ ] 丰富模板：微前端容器、微前端子应用、uni-app等
 - [x] 一键生成module(包含view\[、router、menu])
