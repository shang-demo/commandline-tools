const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const { execAsync } = require('../Util/index');

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
  console.info('ModifiedProject: ', result);

  return Promise
    .map(Object.keys(result), (project) => {
      return path.join(rootPath, project);
    })
    .filter((filePath) => {
      return new Promise(function (resolve, reject) {
        fs.stat(filePath, function (err, stats) {
          if (err) {
            reject(err);
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
      console.info(data.map((filePath) => {
        return path.basename(filePath);
      }).join(','));

      return data;
    });
}

function runJshint(porjectPaths) {
  return Promise.map(porjectPaths, (p) => {
    return execAsync(`cd ${p} && gulp jshint`)
      .then((data) => {
        console.info(`${p} \n ${data}`);
      })
      .catch((e) => {
        console.warn('jshint error', p, e);
      });
  }, { concurrency: 3 });
}