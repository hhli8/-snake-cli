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
  breadthFirst(templateAst, node => {
    if (node.tagName === 'sidebar-item') {
      node.properties[':routes'] = 'routes[0].children';
      return true;
    }
  });
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
  });

  let ObjectExpression;
  scriptAst.program.body.forEach((node, i) => {
    if (node.type === 'ExportDefaultDeclaration') {
      ObjectExpression = node.declaration;
    }
  });

  if (ObjectExpression) {
    let dataProp;
    let computedProp;
    for (const property of ObjectExpression.properties) {
      switch (property.key.name) {
        case 'data':
          dataProp = property;
          break;
        case 'computed':
          computedProp = property;
          break;
        default:
      }
    }
    // 删除routes属性
    if (dataProp) {
      // dataProp.value.properties = dataProp.value.properties.filter()
      const returnStatement = dataProp.body.body.find(n => n.type === 'ReturnStatement');
      returnStatement.argument.properties = returnStatement.argument.properties.filter(
        n => n.key.name !== 'routes',
      );
    }
    const routesProperty = t.objectMethod(
      'method',
      t.identifier('routes'),
      [],
      t.blockStatement([t.returnStatement(t.identifier('this.$store.state.promission.routes'))]),
    );
    if (!computedProp) {
      computedProp = t.objectProperty(
        t.identifier('computed'),
        t.objectExpression([routesProperty]),
      );
    }
    ObjectExpression.properties.push(computedProp);
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

module.exports = async function writeVue(defaultPath = 'src/containers/common/sidebar/index.vue') {
  const filePath = path.resolve(CWD, defaultPath);
  const sfcDescriptor = compiler.parseComponent(fs.readFileSync(filePath, 'utf-8'));

  writeTemplate(sfcDescriptor);
  writeScript(sfcDescriptor);

  fs.writeFileSync(
    // path.resolve(__dirname, '../../playground/out.vue'),
    filePath,
    Stringify(sfcDescriptor, sfcDescriptor),
  );
};
