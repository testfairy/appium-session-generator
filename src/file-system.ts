import fs from 'fs';

const S3_PREFIX = 'TODO/';

const isBrowser = function() {
  return !(
    typeof process !== 'undefined' &&
    process.release.name.search(/node|io.js/) !== -1
  );
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
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      switch (format) {
        case 'text':
          callback(xmlHttp.responseText.toString());
          break;
        case 'binary':
          callback(xmlHttp.response);
          break;
      }
    } else if (xmlHttp.readyState == 4) {
      callback();
    }
  };

  xmlHttp.open('GET', theUrl, true); // true for asynchronous
  xmlHttp.send(null);
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
