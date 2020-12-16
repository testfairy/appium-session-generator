import * as child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as util from 'util';
import { v4 as uuidv4 } from 'uuid';

const exec = util.promisify(child_process.exec);

let S3_PREFIX = 's3/';

let isBrowserCache: boolean | null = null;
export const isBrowser = (): boolean => {
  if (isBrowserCache !== null) {
    return isBrowserCache;
  }

  isBrowserCache = !(
    typeof process !== 'undefined' &&
    process.release &&
    process.release.name &&
    process.release.name.search(/node|io.js/) !== -1
  );

  return isBrowserCache;
};

const httpGetAsync = function(
  theUrl: string,
  format: 'text' | 'binary',
  callback: Function
) {
  if (!isBrowser()) {
    throw new Error('XMLHttpRequest is not supported in node');
  }

  let xmlHttp = new XMLHttpRequest();

  if (format === 'binary') {
    xmlHttp.responseType = 'blob';
  }

  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      switch (format) {
        case 'text':
          callback(xmlHttp.responseText.toString());
          break;
        case 'binary':
          callback(xmlHttp.response);
          break;
      }
    } else if (xmlHttp.readyState === 4) {
      callback();
    }
  };

  xmlHttp.open('GET', theUrl, true); // true for asynchronous
  xmlHttp.send(null);
};

const getFilePathsRecursively = (dir: string): string[] => {
  if (isBrowser()) {
    throw new Error('getFilePathsRecursively is not supported in browser');
  }

  // returns a flat array of absolute paths of all files recursively contained in the dir
  let results: string[] = [];
  let list = fs.readdirSync(dir);

  var pending = list.length;
  if (!pending) return results;

  for (let file of list) {
    file = path.resolve(dir, file);

    if (!fs.existsSync(file)) {
      continue;
    }

    let stat = fs.lstatSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFilePathsRecursively(file));
    } else {
      results.push(file);
    }

    if (!--pending) return results;
  }

  return results;
};

const getZipOfFolder = (dir: string): JSZip => {
  if (isBrowser()) {
    throw new Error('getZipOfFolder is not supported in browser');
  }

  // returns a JSZip instance filled with contents of dir.

  let allPaths = getFilePathsRecursively(dir);

  let zip = new JSZip();
  for (let filePath of allPaths) {
    // let addPath = path.relative(path.join(dir, '..'), filePath); // use this instead if you want the source folder itself in the zip
    let addPath = path.relative(dir, filePath); // use this instead if you don't want the source folder itself in the zip
    let data = fs.readFileSync(filePath);
    let stat = fs.lstatSync(filePath);
    let permissions = stat.mode;

    if (stat.isSymbolicLink()) {
      zip.file(addPath, fs.readlinkSync(filePath), {
        unixPermissions: parseInt('120755', 8), // This permission can be more permissive than necessary for non-executables but we don't mind.
        dir: stat.isDirectory()
      });
    } else {
      zip.file(addPath, data, {
        unixPermissions: permissions,
        dir: stat.isDirectory()
      });
    }
  }

  return zip;
};

export type BinaryFile = Buffer | Blob;

export const readTextFile = async (filePath: string): Promise<string> => {
  if (isBrowser()) {
    return new Promise(function(resolve, reject) {
      httpGetAsync(S3_PREFIX + filePath, 'text', function(data: string) {
        if (data) {
          resolve(data);
        } else {
          reject(new Error('Cannot find ' + filePath + ' in the server!'));
        }
      });
    });
  } else {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
  }
};

export const readBinaryFile = async (filePath: string): Promise<BinaryFile> => {
  if (isBrowser()) {
    return new Promise(function(resolve, reject) {
      httpGetAsync(S3_PREFIX + filePath, 'binary', function(data: BinaryFile) {
        if (data) {
          resolve(data);
        } else {
          reject(new Error('Cannot find ' + filePath + ' in the server!'));
        }
      });
    });
  } else {
    return fs.readFileSync(filePath);
  }
};

export const buildAppiumZipFile = async (): Promise<JSZip> => {
  if (isBrowser()) {
    let templateZipBinary = await readBinaryFile('appium-template.zip');
    return await JSZip.loadAsync(templateZipBinary);
  } else {
    return getZipOfFolder('appium-template');
  }
};

export const buildFlutterDriverZipFile = async (): Promise<JSZip> => {
  if (isBrowser()) {
    let templateZipBinary = await readBinaryFile('flutter-driver.zip');
    return await JSZip.loadAsync(templateZipBinary);
  } else {
    return getZipOfFolder('flutter-driver-template');
  }
};

export const saveZipFileAs = async (filePath: string, zip: JSZip) => {
  if (isBrowser()) {
    await zip
      .generateAsync({ type: 'blob', platform: 'UNIX' })
      .then(function(blob) {
        saveAs(blob, filePath);
      });
  } else {
    await new Promise(function(resolve, reject) {
      zip
        .generateNodeStream({
          platform: 'UNIX',
          type: 'nodebuffer',
          streamFiles: true
        })
        .pipe(fs.createWriteStream(filePath))
        .on('error', function(err) {
          reject(err);
        })
        .on('finish', function() {
          resolve();
        });
    });
  }
};

// Warning : this function mutates given file inplace.
//
// It converts a zip file into another zip file in which all initial content is bundled with npm-bundle
export const rebundleZipFileWithNpmBundle = async (filePath: string) => {
  if (isBrowser()) {
    throw new Error('Rebundling with npm-bundle in browser is not supported!');
  }

  const tempFolderPath = '/tmp/' + uuidv4();
  const tempSrcFilePath = tempFolderPath + '/' + uuidv4();

  fs.mkdirSync(tempFolderPath);
  fs.renameSync(filePath, tempSrcFilePath);

  await exec(`unzip ${tempSrcFilePath} -d ${tempFolderPath}`);

  fs.unlinkSync(tempSrcFilePath);

  await exec(`cd ${tempFolderPath} && npm-bundle`);
  await exec(`cd ${tempFolderPath} && zip -r ${filePath} *.tgz`);

  await exec(`rm -rf ${tempFolderPath}`);
};

export const setAppiumSessionGeneratorS3BaseUrl = (url: string) => {
  S3_PREFIX = url;
};

if (isBrowser()) {
  (window as any).setAppiumSessionGeneratorS3BaseUrl = setAppiumSessionGeneratorS3BaseUrl;
}
