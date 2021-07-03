/* eslint-disable no-restricted-syntax */
/* eslint-disable no-labels */
const path = require('path');
const fs = require('fs');
const parser = require('@babel/parser');
const babel = require('@babel/core');
const t = require('@babel/types');

const CWD = process.cwd();

module.exports = async function writeVue(defaultPath = 'src/router/page.js') {
  const filePath = path.resolve(CWD, defaultPath);
  const entryContent = fs.readFileSync(filePath, 'utf-8');

  const AST = parser.parse(entryContent, {
    sourceType: 'module',
  });

  let routesDeclarationIndex = 0;
  let routesArrayExpression;
  AST.program.body.forEach((node, i) => {
    if (node.type === 'VariableDeclaration') {
      if (node.declarations[0].id.name === 'route' || node.declarations[0].id.name === 'routes') {
        routesDeclarationIndex = i;
        routesArrayExpression = node.declarations[0].init;
      }
    }
  });
  AST.program.body.splice(
    routesDeclarationIndex,
    0,
    t.exportNamedDeclaration(
      t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier('NOT_FOUND'), t.stringLiteral('NOT_FOUND')),
      ]),
    ),
  );

  if (routesArrayExpression) {
    outer: for (const routeObjectExpress of routesArrayExpression.elements) {
      for (const routeObjectProperty of routeObjectExpress.properties) {
        if (routeObjectProperty.key.name === 'path' && routeObjectProperty.value.value === '*') {
          // 直接删掉，稍后新建
          routesArrayExpression.elements = routesArrayExpression.elements.filter(
            n => n !== routeObjectExpress,
          );
          break outer;
        }
      }
    }
    const theNotFoundRouteExpress = t.objectExpression([
      t.objectProperty(t.identifier('path'), t.stringLiteral('*')),
      t.objectProperty(t.identifier('hidden'), t.booleanLiteral(true)),
      t.objectProperty(t.identifier('name'), t.identifier('NOT_FOUND')),
      t.objectProperty(
        t.identifier('component'),
        t.identifier("() => import('@/containers/common/Full')"),
      ),
    ]);
    // theNotFoundRouteExpress.leadingComments = [t.com]
    t.addComment(theNotFoundRouteExpress, 'inner', '为了兼容微前端，请不要随意修改', true);
    routesArrayExpression.elements.push(theNotFoundRouteExpress);
  }

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
  fs.writeFileSync(
    // path.resolve(__dirname, '../../playground/out.js'),
    filePath,
    code,
  );
};
