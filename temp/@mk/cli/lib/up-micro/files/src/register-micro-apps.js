//! 一定要早于vue-router执行
import { registerMicroApps } from 'qiankun';
// import router from '@/router';

const props = {
  platform: 'shop', // boss shop ...
  platformName: '商家后台',
  bizCode: 'streamer', // mokuaitv=魔筷星选  weishi=企鹅小店 streamer=无敌主播
  bizName: '无敌主播',
  env: process.env.VUE_APP_ENV, // dev test wapa beta online
};

let MICRO_APPS = [];
// 条件编译不支持嵌套，所以才这么搞
if (process.env.NODE_ENV === 'development') {
  MICRO_APPS = require('./micro-apps/local').MICRO_APPS;
} else if (process.env.NODE_ENV === 'production') {
  // MICRO_APPS = require('./micro-apps/' + process.env.VUE_APP_ENV).MICRO_APPS;
  /* IFTRUE_envDev */
  MICRO_APPS = require('./micro-apps/dev').MICRO_APPS;
  /* FITRUE_envDev */
  /* IFTRUE_envTest */
  MICRO_APPS = require('./micro-apps/test').MICRO_APPS;
  /* FITRUE_envTest */
  /* IFTRUE_envWapa */
  MICRO_APPS = require('./micro-apps/wapa').MICRO_APPS;
  /* FITRUE_envWapa */
  /* IFTRUE_envBeta */
  MICRO_APPS = require('./micro-apps/beta').MICRO_APPS;
  /* FITRUE_envBeta */
  /* IFTRUE_envOnline */
  MICRO_APPS = require('./micro-apps/online').MICRO_APPS;
  /* FITRUE_envOnline */
}

MICRO_APPS.forEach(app => {
  app.props = props;
});

export const microApps = MICRO_APPS;

registerMicroApps(microApps);

export function isChildRoute(path) {
  function internal(p) {
    return MICRO_APPS.some((app) => p.startsWith(app.activeRule));
  }
  return Array.isArray(path) ? path.some(internal) : internal(path);
}

// // https://github.com/umijs/qiankun/issues/578#issuecomment-629137733
const originAppendChild = HTMLHeadElement.prototype.appendChild;
Object.defineProperty(HTMLHeadElement.prototype, 'appendChild', {
  set() {}, // 使后来的重写操作失效
  get() {
    return newChild => {
      return originAppendChild.call(this, newChild);
    };
  },
});
