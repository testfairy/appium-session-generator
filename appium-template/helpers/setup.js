require('colors');

// Older Sauce Labs documentations uses different storage location for uploaded app files. Opt-in if necessary.
const LEGACY_SAUCELABS = false;

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

function findPerfectoIni() {
  var perfectoConfigPath = path.resolve('perfecto.ini');
  var perfectoConfigExists = fs.existsSync(perfectoConfigPath);

  if (perfectoConfigExists) {
    var properties = propertiesReader(perfectoConfigPath);

    return {
      securityToken: properties.get('Perfecto.security-token'),
      deviceName: properties.get('Perfecto.device-name')
    };
  }

  return null;
}

function findSauceLabsIni() {
  let sauceLabsConfigPath = path.resolve('saucelabs.ini');
  let sauceLabsConfigExists = fs.existsSync(sauceLabsConfigPath);

  if (sauceLabsConfigExists) {
    let properties = propertiesReader(sauceLabsConfigPath);
    let username = properties.get('SauceLabs.username');
    let accessKey = properties.get('SauceLabs.access-key');
    let region = properties.get('SauceLabs.region');
    let deviceOrientation = properties.get('SauceLabs.device-orientation');
    let platformVersion = properties.get('SauceLabs.platform-version');
    let deviceName = properties.get('SauceLabs.device-name');

    return {
      username,
      accessKey,
      region,
      deviceOrientation,
      platformVersion,
      deviceName
    };
  }

  return null;
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

function filterPerfectoCaps(caps) {
  return {
    deviceName: caps.deviceName,
    app: caps.app,
    securityToken: caps.securityToken,
    appPackage: caps.appPackage
  };
}

async function uploadAppToSauceLabs(username, accessKey, region, appPath) {
  //   curl -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -X POST -H "Content-Type: application/octet-stream" \
  // "https://$REGION.saucelabs.com/rest/v1/storage/$SAUCE_USERNAME/$APP_NAME?overwrite=true" --data-binary @path/to/your_file_name

  var splitAppPath = appPath.split('.');
  var id = uuid.v4();
  var appExtension = splitAppPath[splitAppPath.length - 1];
  var appName = id + '.' + appExtension;

  console.log('~Uploading app to Sauce Labs: ' + appName);
  await new Promise(function(resolve, reject) {
    var url =
      'https://' +
      region +
      '.saucelabs.com/rest/v1/storage/' +
      username +
      '/' +
      appName +
      '?overwrite=true';

    var options = {
      body: fs.readFileSync(appPath),
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      auth: {
        user: username,
        pass: accessKey
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

  // https://wiki.saucelabs.com/display/DOCS/Automated+Testing+with+Real+Devices#AutomatedTestingwithRealDevices-RunningYourTestonRealDevices
  let iosPrefix = 'storage:filename=';
  let androidPrefix = 'sauce-storage:';

  // Hush hush
  let prefix =
    !LEGACY_SAUCELABS || appExtension === 'apk' ? androidPrefix : iosPrefix;

  return prefix + appName;
}

module.exports = {
  should: should,
  expect: expect,
  assert: assert,
  findPerfectoIni: findPerfectoIni,
  uploadAppToPerfecto: uploadAppToPerfecto,
  filterPerfectoCaps: filterPerfectoCaps,
  findSauceLabsIni: findSauceLabsIni,
  uploadAppToSauceLabs: uploadAppToSauceLabs
};
