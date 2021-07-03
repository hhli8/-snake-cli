function breadthFirst(p, handler) {
  if (!handler) return;
  const queue = [p];
  let i = 0;
  while (i < queue.length) {
    const current = queue[i++];
    if (handler(current)) {
      break;
    }
    if (current.children && current.children.length > 1) {
      Array.from(current.children).forEach(child => {
        queue.push(child);
      });
    }
  }
}

function depthFirst(p, handler) {
  if (!handler) return;
  const stack = [p];
  while (stack.length) {
    const current = stack.pop();
    if (handler(current)) {
      break;
    }
    if (current.children && current.children.length > 1) {
      let j = current.children.length - 1;
      while (j > -1) {
        stack.push(current.children[j--]);
      }
    }
  }
}
module.exports = {
  depthFirst,
  breadthFirst,
};
