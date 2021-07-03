const compiler = require('vue-template-compiler');
const path = require('path');
const fs = require('fs');
const Stringify = require('vue-sfc-descriptor-stringify');
// const inquirer = require('inquirer');
const parser = require('@babel/parser');
const babel = require('@babel/core');
const t = require('@babel/types');
const htmlCompiler = require('../hast-utils');
const { breadthFirst } = require('../traverseTree');

const CWD = process.cwd();

function writeTemplate(sfcDescriptor) {
  // 插入template
  let templateContent = sfcDescriptor.template.content;
  const templateAst = htmlCompiler.parse(templateContent);
  let routerViewParent;
  breadthFirst(templateAst, node => {
    // node 没有parent属性，太蠢了
    if (node.children && node.children.some(child => child.tagName === 'router-view')) {
      routerViewParent = node;
      return true;
    }
  });
  if (routerViewParent) {
    routerViewParent.children.unshift(
      {
        type: 'text',
        value: '\n',
      },
      {
        type: 'element',
        tagName: 'micro-apps',
        properties: {},
        children: [],
        data: {},
      },
    );
  }
  templateContent = htmlCompiler.stringify(
    templateAst,
    /* {
      printWidth: 100,
      spaceWidth: 2,
      wrapAttributes: true,
    } */
  );

  sfcDescriptor.template.content = templateContent;
}

function writeScript(sfcDescriptor) {
  // 插入script
  let scriptContent = sfcDescriptor.script.content;
  const scriptAst = parser.parse(scriptContent, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  let exportDeclarationIndex = 0;
  let ObjectExpression;
  scriptAst.program.body.forEach((node, i) => {
    // if (node.type === 'ImportDeclaration') {
    //   lastImportDeclarationIndex = i;
    // } else
    if (node.type === 'ExportDefaultDeclaration') {
      ObjectExpression = node.declaration;
      exportDeclarationIndex = i;
    }
  });
  scriptAst.program.body.splice(
    exportDeclarationIndex,
    0,
    t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier('MicroApps'))],
      t.stringLiteral('./micro-apps.vue'),
    ),
  );

  if (ObjectExpression) {
    const componentsProp = ObjectExpression.properties.find(
      property => property.key.name === 'components',
    );
    if (componentsProp) {
      componentsProp.value.properties.push(
        t.objectProperty(t.identifier('MicroApps'), t.identifier('MicroApps'), false, true),
      );
    }
  }

  scriptContent = babel
    .transformFromAstSync(scriptAst, scriptContent, {
      generatorOpts: {
        jsescOption: {
          // escapeEverything: false,
          quotes: 'single',
        },
      },
      babelrc: false,
      configFile: false,
      presets: [],
    })
    .code.replace(/\\u([\d\w]{4})/gi, (m, g) => String.fromCharCode(parseInt(g, 16))); // 中文反转义

  sfcDescriptor.script.content = '\n' + scriptContent;
}

module.exports = async function writeVue(defaultPath = 'src/containers/common/Full.vue') {
  const filePath = path.resolve(CWD, defaultPath);
  // while (!fs.existsSync(filePath)) {
  //   console.log('找不到Full.vue');
  //   const ans = await inquirer.prompt([
  //     {
  //       type: 'input',
  //       name: 'path',
  //       default: defaultPath,
  //       message: '找不到容器组件(例如Full.vue)，请手动输入路径',
  //     },
  //   ]);
  //   if (ans.path.endsWith('.vue')) {
  //     filePath = path.resolve(CWD, ans.path);
  //   }
  // }
  const sfcDescriptor = compiler.parseComponent(fs.readFileSync(filePath, 'utf-8'));

  writeTemplate(sfcDescriptor);
  writeScript(sfcDescriptor);

  fs.writeFileSync(
    // path.resolve(__dirname, '../../playground/out.vue'),
    filePath,
    Stringify(sfcDescriptor, sfcDescriptor),
  );
};
