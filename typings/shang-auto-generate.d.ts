declare let _ = require('lodash');
declare let Promise = require('bluebird');

declare let logger = require('pino')();

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


declare let framework = {
  config: require('config'),
  environment: {}
};



