const Promise = require('bluebird');
const { getProjectPath, getDeepFiles } = require('../Util/index');
const path = require('path');
const escapeRegexp = require('lodash.escaperegexp');
const fs = Promise.promisifyAll(require('fs-extra'));
const humps = require('humps');

let replaceName = process.argv[2];
let dirPath = getProjectPath(2);

// dirPath = '/Users/feng/Github/sails/Wifi-Platform/Console/client/components/yj-store-tag';
// replaceName = 'yj-store-floor';

async function load() {
  if (!replaceName) {
    return new Error('no replaceName found');
  }

  let originName = path.basename(dirPath);
  let decamelizeOriginName = humps.decamelize(originName, { separator: '-' });
  let decamelizeReplaceName = humps.decamelize(replaceName, { separator: '-' });

  let camelizeOriginName = humps.camelize(originName);
  let camelizeReplaceName = humps.camelize(replaceName);

  let files = getDeepFiles(dirPath);

  await Promise
    .map(files, async (filePath) => {
      let fileReg = new RegExp(escapeRegexp(decamelizeOriginName), 'g');
      let writeFilePath = filePath.replace(fileReg, decamelizeReplaceName);

      let doc = await fs.readFileAsync(filePath, 'utf8');
      let docReg1 = new RegExp(escapeRegexp(camelizeOriginName), 'g');
      doc = doc.replace(docReg1, camelizeReplaceName);

      let docReg2 = new RegExp(escapeRegexp(decamelizeOriginName), 'g');
      doc = doc.replace(docReg2, decamelizeReplaceName);

      return {
        filePath: filePath,
        writeFilePath: writeFilePath,
        doc: doc,
      };
    })
    .mapSeries(async (obj) => {
      console.info('start write: ', obj.writeFilePath);
      await fs.ensureFileAsync(obj.writeFilePath);
      await fs.writeFileAsync(obj.writeFilePath, obj.doc);
    });
}

load()
  .then(() => {
    console.info('success');
  })
  .catch(console.warn);
