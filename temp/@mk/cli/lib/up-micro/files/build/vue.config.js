const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const AutoDllPlugin = require('autodll-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const resolve = (dir) => {
  return path.resolve(__dirname, '..', dir);
};

const tmpFilePath = resolve('src/micro-apps/local.js');
if (!fs.existsSync(tmpFilePath)) {
  fs.writeFileSync(tmpFilePath, fs.readFileSync(resolve('src/micro-apps/local.example.js')));
}

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  productionSourceMap: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [resolve('src'), resolve('test')],
          use: [
            'babel-loader',
            {
              loader: 'js-conditional-compile-loader',
              options: {
                isDebug: process.env.NODE_ENV === 'development',
                isProd: process.env.NODE_ENV === 'production',
                envDev: process.env.VUE_APP_ENV === 'dev',
                envTest: process.env.VUE_APP_ENV === 'test',
                envWapa: process.env.VUE_APP_ENV === 'wapa',
                envBeta: process.env.VUE_APP_ENV === 'beta',
                envOnline: process.env.VUE_APP_ENV === 'online',
              },
            },
          ],
        },
      ],
    },
    externals: {
      //   //? vue不要用externals，貌似没啥问题
      //   //? https://qiankun.umijs.org/zh/faq#vue-router-%E6%8A%A5%E9%94%99-uncaught-typeerror-cannot-redefine-property-router
      //   vue: 'Vue',
      //   'element-ui': 'ELEMENT',
      //   'vue-router': 'VueRouter',
      //   vuex: 'Vuex',
      //   // axios: 'axios',
      jquery: 'jQuery',
      echarts: 'echarts',
      //   // 'vue-resource': 'VueResource',
      //   // 'vue-quill-editor': 'VueQuillEditor'
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        jquery: 'jquery',
        'window.jQuery': 'jquery',
        'window.$': 'jquery',
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: './public/index.html',
      }),
      new AutoDllPlugin({
        inject: true,
        debug: process.env.NODE_ENV !== 'production',
        filename: '[name]_[hash].dll.js',
        context: path.join(__dirname, 'public'),
        entry: {
          vendor: [
            'vue',
            'vue-router',
            'vue-resource',
            'vue-progressbar',
            'vue-resource-progressbar-interceptor',
            'vue-photo-preview',
          ],
        },
      }),
    ],
  },
};
