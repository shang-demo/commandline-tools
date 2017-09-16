const path = require('path');
const { getProjectPath } = require('../Util/index');

const projectPath = getProjectPath();
const webpackConfigPath = path.resolve(projectPath, 'webpack.config.js');
const tslintPath = path.resolve(projectPath, 'tslint.json');
const tsConfigPath = path.resolve(projectPath, 'tsconfig.json');
const mainTsPath = path.resolve(projectPath, 'src/main.ts');
const typingsDTsPath = path.resolve(projectPath, 'src/typings.d.ts');
const packaheJsonPath = path.resolve(projectPath, 'package.json');
const srcPath = path.resolve(projectPath, 'src');

const mainTsReplace = `enableProdMode();
}
else {
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
      let _styles = document.head.querySelectorAll('style');
      let styles = Array.prototype.slice.call(_styles);
      styles
        .filter((style: any) => style.innerText.indexOf('_ng') !== -1)
        .map((el: any) => document.head.removeChild(el));
    });
  }`;

const packageJsonReplace = `"start": "webpack-dev-server --hot --port=4201",
    "hmr": "webpack-dev-server --port=4200",`;

const webpackConfigReplace = `
      {
        test: /\\.ts$/,
        loader: 'string-replace-loader',
        query: {
          search: 'SERVER_URL',
          replace: isProd ? METADATA.SERVER_URL.prod : METADATA.SERVER_URL.default,
        }
      },
      
      `;
const webpackMETADATA = `
const METADATA = {
  title: {
    prod: 'prod',
    default: 'development',
  },
  SERVER_URL: {
    default: 'http://localhost:1337',
    prod: 'http://localhost:1337'
  },
};

const isProd = (process.env.NODE_ENV || '').trim() === 'production';

`;

module.exports = {
  webpackConfigPath,
  tslintPath,
  tsConfigPath,
  mainTsPath,
  typingsDTsPath,
  mainTsReplace,
  packaheJsonPath,
  packageJsonReplace,
  webpackConfigReplace,
  webpackMETADATA,
  srcPath,
};