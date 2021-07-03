const path = require('path');
const fs = require('fs');
const parser = require('@babel/parser');
const babel = require('@babel/core');
const t = require('@babel/types');

const CWD = process.cwd();

module.exports = async function (defaultPath = 'src/main.js') {
  const filePath = path.resolve(CWD, defaultPath);
  const entryContent = fs.readFileSync(filePath, 'utf-8');

  const AST = parser.parse(entryContent, {
    sourceType: 'module',
  });

  let routerImportDeclarationIndex = 0;
  // let permissionImportDeclaration;
  let newVueExpression;
  AST.program.body.forEach((node, i) => {
    if (node.type === 'ImportDeclaration') {
      if (node.specifiers[0] && node.specifiers[0].local.name === 'router') {
        routerImportDeclarationIndex = i;
      // } else if (node.source.value === './promission') {
        // permissionImportDeclaration = node;
      }
    } else if (node.type === 'ExpressionStatement') {
      if (node.expression.type === 'NewExpression') {
        newVueExpression = node;
      }
    }
  });

  AST.program.body.splice(
    routerImportDeclarationIndex,
    0,
    t.addComment(
      t.importDeclaration([], t.stringLiteral('./register-micro-apps')),
      'leading',
      '! 一定要早于vue-router执行',
      true,
    ),
    // t.importDeclaration(
    //   [t.importDefaultSpecifier(t.identifier('store'))],
    //   t.stringLiteral('./store'),
    // ),
    // t.importDeclaration(
    //   [t.importDefaultSpecifier(t.identifier('routes'))],
    //   t.stringLiteral('./router/page'),
    // ),
  );

  AST.program.body = AST.program.body.filter(
    n => n !== newVueExpression,
    // n => n !== permissionImportDeclaration && n !== newVueExpression,
  );

  AST.program.body.push(
    t.variableDeclaration('let', [t.variableDeclarator(t.identifier('app'), t.nullLiteral())]),
    t.functionDeclaration(
      t.identifier('render'),
      [],
      t.blockStatement([
        t.ifStatement(
          t.unaryExpression('!', t.identifier('app')),
          t.blockStatement([
            t.expressionStatement(
              t.assignmentExpression(
                '=',
                t.identifier('app'),
                t.newExpression(t.identifier('Vue'), [
                  t.objectExpression([
                    t.objectProperty(t.identifier('el'), t.stringLiteral('#app')),
                    t.objectProperty(t.identifier('router'), t.identifier('router'), false, true),
                    // t.objectProperty(t.identifier('store'), t.identifier('store'), false, true),
                    t.objectProperty(
                      t.identifier('render'),
                      t.arrowFunctionExpression(
                        [t.identifier('h')],
                        t.callExpression(t.identifier('h'), [t.identifier('App')]),
                      ),
                    ),
                  ]),
                ]),
              ),
            ),
          ]),
        ),
      ]),
    ),
    // t.expressionStatement(
    //   t.callExpression(t.memberExpression(t.identifier('store'), t.identifier('commit')), [
    //     t.stringLiteral('addRoutes'),
    //     t.identifier('routes'),
    //   ]),
    // ),
    t.callExpression(t.identifier('render'), []),
  );

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
