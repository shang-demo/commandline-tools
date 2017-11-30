const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const path = require('path');
const inquirer = require('inquirer');
const { getProjectPath, getFiles, getNameMatchFiles } = require('../Util/index');

const jsLibraryMappingsXmlLocalDataPath = path.join(__dirname, 'data/jsLibraryMappings.xml');
const librariesLocalDataPath = path.join(__dirname, 'data/libraries/shang_auto_generate.xml');

const projectPath = getProjectPath();
let serverPath = path.join(projectPath, 'server');
const autoGeneratePath = path.join(projectPath, 'typings/shang-auto-generate.d.ts');
const ideaPath = path.join(projectPath, '.idea');
const jsLibraryMappingsXmlPath = path.join(ideaPath, 'jsLibraryMappings.xml');
const librariesPath = path.join(ideaPath, 'libraries');
const librariesName = 'shang_auto_generate.xml';
const typingsPath = path.join(projectPath, 'typings');


let typingScope = 'server';

if (process.argv[3] === 'sails') {
  serverPath = projectPath;
  typingScope = 'api';
}

const ignoreErrors = true;
const configs = {
  typingsDir: {
    path: path.join(projectPath, 'typings'),
    fun: ensureTypingDir,
  },
  servicesDeclare: {
    path: path.join(serverPath, 'api/services'),
    fun: getServicesDeclare,
  },
  modelsDeclare: {
    path: path.join(serverPath, 'api/models'),
    fun: getModelsDeclare,
  },
  globalDeclare: {
    fun: getGlobal,
  },
  mlopErrorsDeclare: {
    path: path.join(projectPath, 'node_modules', 'mlop-errors'),
    fun: getErrors,
  },
  wifiPlatformErrorsDeclare: {
    path: path.join(projectPath, 'node_modules', 'wifiplatform-errors'),
    fun: getErrors,
  },
  frameworkDeclare: {
    fun: getFramework,
    name: 'framework',
  },
  loggerDeclare: {
    fun: getLogger,
  },
  fsExtraDeclare: {
    fun: fsPromisifyAll
  },
};


function ensureTypingDir(config) {
  return fs.ensureDirAsync(config.path);
}

function getServicesDeclare(config) {
  return getFiles(config.path)
    .map(function (serviceFile) {
      return 'declare let ' + serviceFile.basename + ' = require(\'../server/api/services/' + serviceFile.basename + '\');';
    })
    .then(function (arr) {
      return arr.join('\n');
    });
}

function getModelsDeclare(config) {
  return getFiles(config.path)
    .map(function (modelFile) {
      return 'declare let ' + modelFile.basename + ' = require(\'mongoose\').Model;';
    }).then(function (arr) {
      return arr.join('\n');
    });
}

function getGlobal() {
  return Promise
    .try(function () {
      return `declare let _ = require('lodash');
declare let Promise = require('bluebird');
`;
    });
}

function getErrors(config) {
  var errors;
  try {
    errors = require(config.path);
  }
  catch(e) {
    console.warn(e.message);
    return Promise.resolve('');
  }
  var str = 'let errorRturn: { respons():Object };\nlet Errors: {\n  OperationalError(): void,';
  return Promise
    .map(Object.keys(errors), function (key) {
      return '  ' + key + '(message?:any, extra?:any): errorRturn,';
    })
    .then(function (arr) {
      return str + '\n' + arr.join('\n') + '\n}\ndeclare let Errors: Errors;';
    });
}

function getFramework(config) {
  return Promise
    .try(function () {
      return `
declare let ${config.name} = {
  config: require('config'),
  environment: {}
};
`;
    });
}

function getLogger() {
  return Promise
    .try(function () {
      return 'declare let logger = require(\'pino\')();';
    });
}

function addToIml(file) {
  var str = `<orderEntry type="library" name="shang-auto-generate" level="project" />`;

  return fs.readFileAsync(file.path)
    .then(function (buffer) {
      var data = buffer.toString();
      data = data.replace(str, '');
      data = data.replace('</component>', `  ${str}\n  </component>`);

      return fs.writeFileAsync(file.path, data);
    });
}

function fsPromisifyAll() {
  return Promise.try(() => {
    return `
let Buffer = require('node').Buffer;
declare let  fs: {
  renameAsync(oldPath: string, newPath: string): Promise<void>;
  truncateAsync(path: string | Buffer, len?: number): Promise<void>;
  ftruncateAsync(fd: number, len?: number): Promise<void>;
  chownAsync(path: string | Buffer, uid: number, gid: number): Promise<void>;
  fchownAsync(fd: number, uid: number, gid: number): Promise<void>;
  lchownAsync(path: string | Buffer, uid: number, gid: number): Promise<void>;
  chmodAsync(path: string | Buffer, mode: string | number): Promise<void>;
  fchmodAsync(fd: number, mode: string | number): Promise<void>;
  lchmodAsync(path: string | Buffer, mode: string | number): Promise<void>;
  statAsync(path: string | Buffer): Promise<fs.Stats>;
  lstatAsync(path: string | Buffer): Promise<fs.Stats>;
  fstatAsync(fd: number): Promise<fs.Stats>;
  linkAsync(srcpath: string | Buffer, dstpath: string | Buffer): Promise<void>;
  symlinkAsync(srcpath: string | Buffer, dstpath: string | Buffer, type?: string): Promise<void>;
  readlinkAsync(path: string | Buffer): Promise<string>;
  realpathAsync(path: string | Buffer): Promise<string>;
  unlinkAsync(path: string | Buffer): Promise<void>;
  rmdirAsync(path: string | Buffer): Promise<void>;
  mkdirAsync(path: string | Buffer, mode?: string | number): Promise<void>;
  readdirAsync(path: string | Buffer): Promise<string[]>;
  closeAsync(fd: number): Promise<void>;
  openAsync(path: string | Buffer, flags: string | number, mode?: number): Promise<number>;
  utimesAsync(path: string | Buffer, atime: number | Date, mtime: number | Date): Promise<void>;
  futimesAsync(fd: number, atime: number | Date, mtime: number | Date): Promise<void>;
  fsyncAsync(fd: number): Promise<void>;
  writeAsync(fd: number, data: string, position?: number, encoding?: string): Promise<[number, string]>;
  writeAsync(fd: number, buffer: Buffer, offset: number, length: number, position?: number): Promise<[number, Buffer]>;
  readAsync(fd: number, buffer: Buffer, offset: number, length: number, position: number): Promise<[number, Buffer]>;
  readFileAsync(file: string | number | Buffer, options?:
             { encoding?: "buffer" | null; flag?: string; }
             | "buffer"
             | null): Promise<Buffer>;
  readFileAsync(file: string | number | Buffer, options: { encoding: string; flag?: string; } | string): Promise<string>;
  writeFileAsync(file: string | number | Buffer, data: string | Buffer, options?:
              { encoding?: string | null; mode?: string | number; flag?: string; }
              | string
              | null): Promise<void>;
  appendFileAsync(file: string | number | Buffer, data: string | Buffer, options?:
               { encoding?: string | null; mode?: number | string; flag?: string; }
               | string
               | null): Promise<void>;
  existsAsync(path: string): Promise<boolean>;
  accessAsync(path: string, mode?: number): Promise<void>;
  copyAsync(src: string, dest: string, options?: {overwrite: boolean, errorOnExist: boolean, dereference: boolean, preserveTimestamps: boolean, filter: Function});
  emptyDirAsync(dir: string);
  emptydirAsync(dir: string);
  ensureFileAsync(file: string);
  createFileAsync(file: string);
  ensureDirAsync(dir: string);
  mkdirsAsync(dir: string);
  mkdirpAsync(dir: string);
  ensureLinkAsync(srcpath: string, dstpath: string);
  ensureSymlinkAsync(srcpath: string, dstpath: string, type: string);
  moveAsync(src: string, dest: string, options?: {overwrite: boolean});
  outputFileAsync(file: string, data: string|Buffer|Uint8Array, options?: Object | string);
  outputJsonAsync(file: string, object:Object, options?: Object);
  readJsonAsync(file: string, options:Object);
  removeAsync(path: string);
  writeJsonAsync(file: string, object:Object, options?: Object);
  writeJSONAsync(file: string, object:Object, options?: Object);
};
`
  });
}

function replaceJsLibraryMappings() {
  return Promise
    .try(() => {
      return fs.readFileAsync(jsLibraryMappingsXmlPath)
        .catch(function (e) {
          return fs.readFileAsync(jsLibraryMappingsXmlLocalDataPath);
        });
    })
    .then(function (buffer) {
      var data = buffer.toString();
      data = data.replace(/\s*<file url="file:\/\/\$PROJECT_DIR\$\/(server|api)" libraries="{shang-auto-generate}" \/>\n/g, '');
      data = data.replace(/,\s*shang-auto-generate/gi, '');
      data = data.replace(`<component name="JavaScriptLibraryMappings">`, `<component name="JavaScriptLibraryMappings">\n    <file url="file://$PROJECT_DIR$/${typingScope}" libraries="{shang-auto-generate}" />\n`);
      return fs.writeFileAsync(jsLibraryMappingsXmlPath, data);
    })
    .then(function () {
      return fs.mkdirAsync(librariesPath)
        .catch(function () {
        });
    })
    .then(function () {
      return fs.readFileAsync(librariesLocalDataPath);
    })
    .then(function (data) {
      return fs.writeFileAsync(path.join(librariesPath, librariesName), data);
    })
    .then(function () {
      return getNameMatchFiles(ideaPath, /\.iml$/);
    })
    .then(function (files) {
      if(!files.length) {
        console.warn('no file found');
        return null;
      }
      return addToIml(files[0]);
    });
}

function simpleAssign(arg1, arg2) {
  Object.keys(arg2).forEach((key) => {
    arg1[key] = arg2[key];
  });

  return arg1;
}

function run(name) {
  let config = configs[name];
  return config.fun(config)
    .catch((e) => {
      if(ignoreErrors) {
        console.warn(e.message);
        return '';
      }

      return Promise.reject(e);
    });
}

function init() {
  return run('typingsDir')
    .then(function () {
      return Promise
        .all([
          'globalDeclare',
          'loggerDeclare',
          'fsExtraDeclare',
          'frameworkDeclare',
          'mlopErrorsDeclare',
          'wifiPlatformErrorsDeclare',
          'modelsDeclare',
          'servicesDeclare',
        ].map((name) => {
          return run(name);
        }));
    })
    .then(function (arr) {
      return fs.writeFileAsync(autoGeneratePath, arr.join('\n'));
    })
    .then(function () {
      return replaceJsLibraryMappings();
    });
}


inquirer
  .prompt({
    type: 'confirm',
    name: 'confirm',
    message: JSON.stringify({
      projectPath: projectPath,
    }, null, 2),
  })
  .then(function (answer) {
    if (answer.confirm) {
      init();
    }
  })
  .catch((e) => {
    console.warn(e);
  });
