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

    return { host };
  }

  return null;
}

exports.aws = {
  // AWS Device Farm exposes its server as localhost
  host: 'localhost',
  port: 4723
};

exports.perfecto = findPerfectoHost();
