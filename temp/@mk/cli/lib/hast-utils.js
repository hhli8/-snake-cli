const { HtmlParser } = require('@starptech/webparser');
const fromWebparser = require('@starptech/hast-util-from-webparser');
const prettyhtml = require('@starptech/prettyhtml');
const toHTML = require('@starptech/prettyhtml-hast-to-html');

const HTML = new HtmlParser();

module.exports = {
  parse(code) {
    return fromWebparser(HTML.parse(code).rootNodes);
  },
  stringify(hast, prettyOptions) {
    let code = toHTML(hast);
    if (prettyOptions) {
      code = prettyhtml(code, prettyOptions).contents;
    }
    return code;
  },
};
