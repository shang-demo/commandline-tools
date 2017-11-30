const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const { execAsync } = require('../Util/index');
const chalk = require('chalk');

const PROJECT_PATH = process.cwd();
let ROOT_PATH;
let headLength = process.argv[2] || '1';
let showDeployProject = !!process.argv[3];

execAsync(`cd ${PROJECT_PATH} && git rev-parse --show-toplevel`)
  .then((str) => {
    ROOT_PATH = str.replace(/[\r\n]/, '');
    console.info('ROOT_PATH: ', ROOT_PATH);
  })
  .then(() => {
    return execAsync(`cd ${ROOT_PATH} && git diff --name-only HEAD~${headLength}`);
  })
  .then((str) => {
    return getModifiedProjectPath(ROOT_PATH, str);
  })
  .then((arr) => {
    if (showDeployProject) {
      return null;
    }
    return runJshint(arr);
  })
  .catch((e) => {
    console.warn(e);
  });

function getModifiedProject(str) {
  let arr = str.split('\n');
  let result = {};

  arr.forEach((item) => {
    if (!item) {
      return;
    }

    let key = item.replace(/\/.*/, '');
    if (!key) {
      console.info('item: ', item);
      return;
    }

    result[key] = (result[key] || 0) + 1;
  });

  return result;
}

function getModifiedProjectPath(rootPath, str) {
  let result = getModifiedProject(str);
  console.info('ModifiedProject: ', JSON.stringify(result));

  return Promise
    .map(Object.keys(result), (project) => {
      return path.join(rootPath, project);
    })
    .filter((filePath) => {
      return new Promise(function (resolve, reject) {
        fs.stat(filePath, function (err, stats) {
          if (err) {
            console.warn(err);
            resolve(false);
            return null;
          }

          if (stats.isDirectory()) {
            return resolve(true);
          }
          return resolve(false);
        });
      });
    })
    .then(function (data) {
      console.info('deploy project: ');
      console.info(
        chalk.green(data.map((filePath) => {
          return path.basename(filePath);
        }).join(','))
      );

      return data;
    });
}

function runJshint(porjectPaths) {
  return Promise.map(porjectPaths, (p) => {
    return new Promise(function (resolve, reject) {
      fs.stat(`${p}/gulpfile.js`, function (err, stats) {
        if (err) {
          return reject(new Error('no gulpfile.js'));
        }

        if (stats.isFile()) {
          return resolve();
        }

        return reject(new Error('no gulpfile.js'));
      });
    })
      .then(function () {
        return execAsync(`cd ${p} && gulp jshint`);
      })
      .then((data) => {

        var result = {
          p: p,
          str: `${p} \n ${data}`,
        };

        if (/line.*/gi.test(data)) {
          data = data.replace(/line.*/gi, function (str) {
            return chalk.red(str);
          });

          result.err = new Error(RegExp.$1);
        }

        console.info(`${p} \n ${data}`);

        return result;
      })
      .catch((e) => {
        var result = {
          str: `${p}  ${e.message}`,
          err: e,
          p: p,
        };

        console.info(chalk.yellow(result.str));
        console.info(e);
        return result;
      });
  }, { concurrency: 3 })
    .then(function (arr) {
      var successArr = [];
      var failedArr = [];
      var warningArr = [];

      arr.forEach(function (item) {
        if (item.err) {
          if (item.err.message === 'no gulpfile.js') {
            warningArr.push(item);
          }
          else {
            failedArr.push(item);
          }
        }
        else {
          successArr.push(item);
        }
      });

      console.info('\n');
      console.info(chalk.green('success:', successArr.length), chalk.red('failed:', failedArr.length), chalk.yellow('warning:', warningArr.length));
      console.info('\n');
    });
}