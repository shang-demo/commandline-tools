const fs = require('fs');
const path = require('path');

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
  tsConfigPath,
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

  // css => scss
  await exec(`mv ${srcPath}/styles.css ${srcPath}/styles.scss`);
  await replace(webpackConfigPath, [
    [
      /styles\.css/g,
      'styles.scss',
    ]
  ]);

  // ngx-progressbar
  console.info('npm i -S shang-package/ngx-progressbar#package');
  await exec(`npm i -S shang-package/ngx-progressbar#package`);

  let sharedPath = path.resolve(__dirname, 'data/shared');
  await exec(`cp -r "${sharedPath}" ${srcPath}/app`);
  await exec(`rm "${srcPath}/app/app.component.spec.ts"`);

  await replace(`${srcPath}/app/app.module.ts`, [
    [
      'import { AppComponent } from \'./app.component\';',
      'import { HTTP_INTERCEPTORS } from \'@angular/common/http\';\nimport { NgProgressInterceptor } from \'ngx-progressbar\';\nimport { SharedModule } from \'./shared/shared.module\';\nimport { AppComponent } from \'./app.component\';'
    ],
    [
      /BrowserModule,?(\s+)?\n/,
      'BrowserModule,\n    SharedModule,\n'
    ],
    [
      /providers: \[],?(\s+)?\n/,
      'providers: [\n    {\n      provide: HTTP_INTERCEPTORS,\n      useClass: NgProgressInterceptor,\n      multi: true,\n    },\n  ],'
    ]
  ]);

  let html = '<div>\n  <ng-progress color="blue"></ng-progress>\n</div>';
  await exec(`echo "${html}" > "${srcPath}/app/app.component.html"`);

  // apollo-angular
  console.info(`npm i -S apollo-client apollo-angular graphql-tag`);
  await exec(`npm i -S apollo-client apollo-angular graphql-tag`);

  await replace(tsConfigPath, [
    /"dom",?(\s+)?\n/,
    '"dom",\n      "esnext.asynciterable"\n',
  ]);

  let utilsPath = path.resolve(__dirname, 'data/utils');
  await exec(`cp -r "${utilsPath}" ${srcPath}/app`);

  await replace(`${srcPath}/app/app.module.ts`, [
    [
      'import { NgProgressInterceptor } from \'ngx-progressbar\';',
      'import { NgProgressInterceptor } from \'ngx-progressbar\';\n' +
      'import { ApolloModule } from \'apollo-angular\';\n\nimport { provideClient } from \'./utils/apollo-client/provide-client\';'
    ],
    [
      /SharedModule,?(\s+)?\n/,
      'SharedModule,\n    ApolloModule.forRoot(provideClient),\n'
    ],
  ]);
}

start()
  .catch((e) => {
    console.warn(e);
  });