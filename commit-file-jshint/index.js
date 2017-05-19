const path = require('path');
const Promise = require('bluebird');
const { execAsync } = require('../Util/index');

const PROJECT_PATH = process.cwd();
let ROOT_PATH;
let headLength = process.argv[2] || '1';

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
  .then(runJshint)
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

  return Object.keys(result)
    .map((project) => {
      return path.join(rootPath, project);
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