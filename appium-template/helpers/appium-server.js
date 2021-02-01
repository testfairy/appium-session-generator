const fs = require('fs');
const path = require('path');
const propertiesReader = require('properties-reader');

function findPerfectoHost() {
  let perfectoConfigPath = path.resolve('perfecto.ini');
  let perfectoConfigExists = fs.existsSync(perfectoConfigPath);

  if (perfectoConfigExists) {
    let properties = propertiesReader(perfectoConfigPath);
    let host = properties.get('Perfecto.host');

    if (host.indexOf('.perfectomobile.com') === -1) {
      host += '.perfectomobile.com';
    }

    let driverEndpoint =
      'https://' + host + '/nexperience/perfectomobile/wd/hub/fast';

    return { host, driverEndpoint };
  }

  return null;
}

function findSauceLabsHost() {
  let sauceLabsConfigPath = path.resolve('saucelabs.ini');
  let sauceLabsConfigExists = fs.existsSync(sauceLabsConfigPath);

  if (sauceLabsConfigExists) {
    let properties = propertiesReader(sauceLabsConfigPath);
    let username = properties.get('SauceLabs.username');
    let accessKey = properties.get('SauceLabs.access-key');
    let datacenter = properties.get('SauceLabs.datacenter');

    let host = username + ':' + accessKey + '@' + datacenter;
    let driverEndpoint = 'https://' + host + ':443/wd/hub';

    return { host, driverEndpoint };
  }

  return null;
}

exports.local = {
  host: 'localhost',
  port: 4723
}

exports.aws = {
  // AWS Device Farm exposes its server as localhost
  host: 'localhost',
  port: 4723
};

exports.perfecto = findPerfectoHost();
exports.saucelabs = findSauceLabsHost();
