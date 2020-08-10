const fs = require('fs');
const path = require('path');
const propertiesReader = require('properties-reader');

function findPerfectoIni() {
  let perfectoConfigPath = path.resolve('perfecto.ini');
  let perfectoConfigExists = fs.existsSync(perfectoConfigPath);

  if (perfectoConfigExists) {
    let properties = propertiesReader(perfectoConfigPath);
    let host = properties.get('Perfecto.host');
    let port = 443;

    if (host.indexOf('.perfectomobile.com') === -1) {
      host += '.perfectomobile.com';
    }

    return { host, port }; // TODO : figure out correct values
  }

  return null;
}

exports.aws = {
  // AWS Device Farm exposes it's server as localhost
  host: 'localhost',
  port: 4723
};

exports.perfecto = findPerfectoIni();
