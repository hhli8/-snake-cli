const t = require('@babel/types');

// 进支持json允许的类型
function json2node(obj, customMap = {}) {
  if (obj === null) {
    return t.nullLiteral();
  }
  if (Array.isArray(obj)) {
    return t.arrayExpression(obj.map((el) => json2node(el)));
  }
  switch (typeof obj) {
    case 'string':
      return t.stringLiteral(obj);
    case 'number':
      return t.numericLiteral(obj);
    case 'boolean':
      return t.booleanLiteral(obj);
    case 'object':
      return t.objectExpression(
        Object.entries(obj).map(([key, value]) =>
          t.objectProperty(
            t.identifier(key),
            typeof customMap[key] === 'function' ? customMap[key](value) : json2node(value),
          ),
        ),
      );
    default:
      return t.identifier('undefined');
  }
}

function routeConfig2AstNode(route = {}) {
  return json2node(route, {
    component: (value) =>
      t.arrowFunctionExpression(
        [],
        t.callExpression(t.identifier('import'), [t.stringLiteral(value)]),
      ),
  });
}

function addRoutes(parentRoute, ...routes) {
  let theChildrenProperty = parentRoute.properties.find((p) => p.key.name === 'children');
  const additionElements = routes.map((route) => routeConfig2AstNode(route));
  if (!theChildrenProperty) {
    parentRoute.properties.push(
      (theChildrenProperty = t.objectProperty(
        t.identifier('children'),
        t.arrayExpression(additionElements),
      )),
    );
    return;
  }
  theChildrenProperty.value.elements.find((ele) => {
    const thePathProperty = ele.properties.find((prop) => prop.key.name === 'path');
    // console.log(thePathProperty);
    if (routes.some((route) => route.path === thePathProperty.value.value)) {
      throw new Error('目标路径已存在');
    }
  });
  theChildrenProperty.value.elements = theChildrenProperty.value.elements.concat(additionElements);
}

function findRoute(parentRoute, paths = []) {
  // console.log(paths);
  if (!parentRoute) throw new Error('parentRoute doesn\'t exist')
  if (paths.length === 0) return parentRoute;
  let theChildrenProperty = parentRoute.properties.find((p) => p.key.name === 'children');
  // console.log(theChildrenProperty);
  const currentPath = paths.shift();
  if (!theChildrenProperty) {
    throw new Error(`路径${currentPath}不存在`);
  }
  for (let childRoute of theChildrenProperty.value.elements) {
    const thePathProperty = childRoute.properties.find((prop) => prop.key.name === 'path');
    // console.log(thePathProperty);
    if (!thePathProperty) {
      throw new Error(`路由${currentPath}存在非法设置path`)
    }
    if (thePathProperty.value.value === currentPath) {
      return findRoute(childRoute, paths)
      // break;
    }
  }
  throw new Error(`路径${currentPath}不存在`);
}

module.exports = {
  json2node,
  addRoutes,
  findRoute,
};
