const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const flattenDeep = require('lodash.flattendeep');

const svc = {
  getProjectPath: function (index = 2) {
    return process.argv[index] ? path.resolve(process.cwd(), process.argv[index]) : process.cwd();
  },
  getFiles: function (dirPath, options = {}) {
    return Promise
      .try(function () {
        return fs.readdirAsync(dirPath);
      })
      .then(function (fileNames) {
        return Promise
          .map(fileNames, function (fileName) {
            let filePath = path.join(dirPath, fileName);

            if (options.extname === undefined) {
              options.extname = '.js';
            }

            if (options.extname) {
              let extname = path.extname(filePath);
              if (extname !== '.js') {
                return null;
              }
            }

            return fs.statAsync(filePath)
              .then(function (stat) {
                return {
                  basename: fileName.replace(/\.js/i, ''),
                  name: fileName,
                  path: filePath,
                  stat: stat
                };
              });
          });
      })
      .filter(function (file) {
        return file && file.stat && file.stat.isFile();
      });
  },
  getNameMatchFiles: function (dirPath, reg) {
    return svc.getFiles(dirPath, { extname: null })
      .filter((file) => {
        return reg.test(file.name);
      });
  },
  defer() {
    let resolve;
    let reject;
    let promise = new Promise((...param) => {
      resolve = param[0];
      reject = param[1];
    });
    return {
      resolve,
      reject,
      promise,
    };
  },
  spawnDefer(option) {
    let deferred = svc.defer();
    if (!option) {
      return deferred.reject(new Error('no option'));
    }

    if (option.platform) {
      // eslint-disable-next-line no-param-reassign
      option.cmd = (process.platform === 'win32' ? (`${option.cmd}.cmd`) : option.cmd);
    }
    let opt = {
      stdio: 'inherit',
    };
    // set ENV
    let env = Object.create(process.env);
    env.NODE_ENV = option.NODE_ENV || process.env.NODE_ENV;
    opt.env = env;

    let proc = spawn(option.cmd, option.arg, opt);
    deferred.promise.proc = proc;
    proc.on('error', (err) => {
      console.info(err);
    });
    proc.on('exit', (code) => {
      if (code !== 0) {
        return deferred.reject(code);
      }
      return deferred.resolve();
    });
    return deferred.promise;
  },
  spawnAsync(option) {
    if (!option) {
      return Promise.reject(new Error('no option'));
    }

    return new Promise((resolve, reject) => {
      if (option.platform) {
        // eslint-disable-next-line no-param-reassign
        option.cmd = (process.platform === 'win32' ? (`${option.cmd}.cmd`) : option.cmd);
      }
      let opt = { stdio: 'inherit' };
      // set ENV
      let env = Object.create(process.env);
      env.NODE_ENV = option.NODE_ENV || process.env.NODE_ENV;
      opt.env = env;

      let cmd = spawn(option.cmd, option.arg, opt);
      cmd.on('error', (err) => {
        console.error(err);
      });
      cmd.on('exit', (code) => {
        if (code !== 0) {
          return reject(code);
        }
        return resolve();
      });
    });
  },
  execAsync(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        return resolve(stdout || stderr);
      });
    });
  },
  promiseWhile: Promise.method((condition, action) => {
    if (!condition()) {
      return Promise.resolve(null);
    }
    return action().then(svc.promiseWhile.bind(null, condition, action));
  }),
  async getDeepFiles(dirPath, { extname = null, deep = null, exclude = ['.git', '.idea', 'node_modules'] } = {}) {
    let stat = await fs.statAsync(dirPath);

    // 如果是文件, 直接返回数据
    if (stat.isFile()) {
      if (extname && dirPath.match(extname)) {
        return [];
      }

      return [dirPath];
    }

    if (deep === 0) {
      return [];
    }
    if (deep) {
      deep = deep - 1;
    }

    let fileNames = await fs.readdirAsync(dirPath);

    let filePaths = fileNames
      .filter((fileName) => {
        if (exclude && exclude.length) {
          return exclude.indexOf(fileName) < 0;
        }
        return true;
      })
      .map((fileName) => {
        return path.join(dirPath, fileName);
      });

    let files = await Promise.map(filePaths, (filePath) => {
      return svc.getDeepFiles(filePath, { extname, deep });
    });

    return flattenDeep(files);
  },
};


module.exports = svc;
