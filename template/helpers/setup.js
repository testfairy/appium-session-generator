require('colors');

var fs = require('fs');
var path = require('path');
var propertiesReader = require('properties-reader');
var request = require('request');
var wd = require('wd');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var uuid = require('uuid');

chai.use(chaiAsPromised);

var should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
var expect = chai.expect;
var assert = chai.assert;

function findPerfectoSecurityToken() {
  var perfectoConfigPath = path.resolve('perfecto.ini');
  var perfectoConfigExists = fs.existsSync(perfectoConfigPath);

  if (perfectoConfigExists) {
    var properties = propertiesReader(perfectoConfigPath);

    return properties.get('Perfecto.security-token');
  }

  return;
}

async function uploadAppToPerfecto(host, securityToken, appPath) {
  var splitAppPath = appPath.split('.');
  var id = uuid.v4();
  var appExtension = splitAppPath[splitAppPath.length - 1];
  var appName = 'PRIVATE:applications/' + id + '.' + appExtension;

  console.log('~Uploading app to Perfecto: ' + appName);
  await new Promise(function(resolve, reject) {
    var url =
      'https://' +
      host +
      '/services/repositories/media/' +
      appName +
      '?operation=upload&overwrite=true&securityToken=' +
      securityToken;

    var options = {
      body: fs.readFileSync(appPath),
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    };

    request.post(url, options, function(error, response, responseBody) {
      if (!error && response.statusCode == 200) {
        console.log('~Uploaded!'.green);
        resolve();
      } else {
        console.error(
          response && response.statusCode ? response.statusCode.red : ''
        );
        console.error('\n');
        console.error(responseBody);
        console.error('\n~Upload failed!'.red);
        reject(error);
      }
    });
  });

  return appName;
}

module.exports = {
  should: should,
  expect: expect,
  assert: assert,
  findPerfectoSecurityToken: findPerfectoSecurityToken,
  uploadAppToPerfecto: uploadAppToPerfecto
};
