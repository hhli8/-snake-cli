const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');
const { addRoutes, findRoute } = require('../ast-utils');

async function promptRouteConfig() {
  const ret = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'hidden',
      default: false,
      message: '隐藏菜单(hidden)',
    },
    {
      type: 'input',
      name: 'id',
      // default: 0,
      message: 'id',
    },
  ]);
  if (!ret.hidden) {
    const { sort, ...meta } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        default: '新菜单',
        message: '菜单名称',
      },
      {
        type: 'input',
        name: 'icon',
        default: 'icon-star',
        message: '菜单图标',
      },
      {
        type: 'input',
        name: 'sort',
        // default: 0,
        message: '排序',
      },
      {
        type: 'confirm',
        default: false,
        name: 'isAlone',
        message: '隐藏子菜单(isAlone)',
      },
    ]);
    if (typeof sort === 'number') ret.sort = sort;
    ret.meta = meta;
  }
  if (typeof id !== 'number') delete ret.id;
  return ret;
}

async function writeRoute(filepath, moduleName, paths = []) {
  let _resolve;
  let _reject;
  const defered = new Promise((resolve, reject) => {
    _reject = reject;
    _resolve = resolve;
  });

  const componentPath = `@/views/${moduleName}/${paths.join('/')}/index.vue`;
  const name = paths.pop();
  const entryContent = fs.readFileSync(filepath, 'utf-8');

  const AST = parser.parse(entryContent, {
    sourceType: 'module',
  });

  async function next(target) {
    const { meta = {}, ...props } = await promptRouteConfig();
    const routeConfig = {
      name,
      path: name,
      ...props,
      meta: { ...meta, index: moduleName },
      component: componentPath,
    };
    addRoutes(target, routeConfig);
    transform();
  }

  // visitor
  traverse(AST, {
    ExportDefaultDeclaration: ppath => {
      try {
        const target = findRoute(ppath.node.declaration, paths);
        try {
          // 去重提醒
          if (findRoute(target, [name])) {
            _reject(new Error(`目标${name}已存在`));
          }
        } catch (err) {
          next(target);
        }
      } catch (error) {
        _reject(error);
      }
    },
  });

  function transform() {
    let { code } = babel.transformFromAstSync(AST, entryContent, {
      generatorOpts: {
        jsescOption: {
          // escapeEverything: false,
          quotes: 'single',
        },
      },
      babelrc: false,
      configFile: false,
      presets: [],
    });
    // 中文反转义
    code = code.replace(/\\u([\d\w]{4})/gi, (m, g) => String.fromCharCode(parseInt(g, 16)));
    fs.writeFileSync(filepath, code);
    _resolve();
  }

  return defered;
}

module.exports = {
  promptRouteConfig,
  writeRoute,
};
