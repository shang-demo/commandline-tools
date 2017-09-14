const fs = require('fs');

const promisify = function (func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      args.push(function (err, result) {
        err ? reject(err) : resolve(result);
      });

      func(...args);
    });
  }
};

const exec = promisify(require('child_process').exec);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const {
  webpackConfigPath,
  tslintPath,
  mainTsPath,
  typingsDTsPath,
  mainTsReplace,
  packaheJsonPath,
  packageJsonReplace,
  webpackConfigReplace,
  webpackMETADATA,
  srcPath,
} = require('./constants');

async function replace(filePath, replaceArr) {
  let txt = await readFile(filePath, {
    encoding: 'utf8',
  });

  if (!replaceArr[0][0]) {
    replaceArr = [replaceArr];
  }

  replaceArr.forEach((arr) => {
    txt = txt.replace(arr[0], arr[1]);
  });

  await writeFile(filePath, txt);
}

async function start() {
  console.info('ng eject -e prod --aot');
  await exec(`ng eject -e prod --aot`);

  // 替换 路径
  await replace(webpackConfigPath, [
    [/"\/Users\/feng\/Github\/shang-template\/[^/]+\/src\/"/g, 'path.join(__dirname, \'src/\')'],
    ['"environments/environment.prod.ts"', '"environments/environment.ts"'],
  ]);


  // tsconfig
  await replace(tslintPath, [
    ['"prefer-const": true', '"prefer-const": false'],
    [/,\n\s+"check-else""/, '"'],
    [/,\n\s+"check-whitespace"\n\s+"/, '"'],
  ]);


  // hmr
  console.info('npm install @angularclass/hmr -D');
  await exec(`npm install @angularclass/hmr -D`);

  await replace(mainTsPath, [
    /enableProdMode\(\);/,
    mainTsReplace
  ]);

  await replace(typingsDTsPath, [
    /id:\s+string;/,
    'id: string;\n  hot: any;'
  ]);

  await replace(packaheJsonPath, [
    /"start":.*/,
    packageJsonReplace,
  ]);

  // string-replace
  console.info('npm install string-replace-loader -D');
  await exec(`npm install string-replace-loader -D`);
  await replace(webpackConfigPath, [
    [
      /(module\.exports = {)/,
      `${webpackMETADATA}\$1`,
    ],
    [
      /({[^{}]+?"@ngtools\/webpack"[^}]+)/gmi,
      `${webpackConfigReplace}\$1`
    ]
  ]);

  // title replace
  await  replace(webpackConfigPath, [
    [
      /"template": "\.\/src\/index\.html",/,
      '"template": "./src/index.ejs",'
    ],
    [
      '"title": "Webpack App",',
      '"title": isProd ? METADATA.title.prod : METADATA.title.default,'
    ]
  ]);

  await replace(`${srcPath}/index.html`, [
    /<title>.*?<\/title>/,
    '<title><%= htmlWebpackPlugin.options.title %></title>',
  ]);

  await exec(`mv ${srcPath}/index.html ${srcPath}/index.ejs`);
}

start()
  .catch((e) => {
    console.warn(e);
  });