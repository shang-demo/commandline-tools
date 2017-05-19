const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

const svc = {
  getProjectPath: function () {
    return process.argv[2] ? path.join(process.cwd(), process.argv[2]) : process.cwd();
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
};


module.exports = svc;