import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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

export const readTextFile = async (fileName: string): Promise<string> => {
  if (isBrowser()) {
    return new Promise(function(resolve, reject) {
      httpGetAsync(S3_PREFIX + fileName, 'text', function(data: string) {
        if (data) {
          resolve(data);
        } else {
          reject(new Error('Cannot find ' + fileName + ' in the server!'));
        }
      });
    });
  } else {
    return fs.readFileSync(fileName, { encoding: 'utf8' });
  }
};

export const readBinaryFile = async (fileName: string): Promise<BinaryFile> => {
  if (isBrowser()) {
    return new Promise(function(resolve, reject) {
      httpGetAsync(S3_PREFIX + fileName, 'binary', function(data: BinaryFile) {
        if (data) {
          resolve(data);
        } else {
          reject(new Error('Cannot find ' + fileName + ' in the server!'));
        }
      });
    });
  } else {
    return fs.readFileSync(fileName);
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

export const saveZipFileAs = async (fileName: string, zip: JSZip) => {
  if (isBrowser()) {
    await zip
      .generateAsync({ type: 'blob', platform: 'UNIX' })
      .then(function(blob) {
        saveAs(blob, fileName);
      });
  } else {
    await new Promise(function(resolve, reject) {
      zip
        .generateNodeStream({
          platform: 'UNIX',
          type: 'nodebuffer',
          streamFiles: true
        })
        .pipe(fs.createWriteStream(fileName))
        .on('error', function(err) {
          reject(err);
        })
        .on('finish', function() {
          resolve();
        });
    });
  }
};

export const setAppiumSessionGeneratorS3BaseUrl = (url: string) => {
  S3_PREFIX = url;
};

if (isBrowser()) {
  (window as any).setAppiumSessionGeneratorS3BaseUrl = setAppiumSessionGeneratorS3BaseUrl;
}
