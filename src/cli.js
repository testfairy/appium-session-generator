'use strict';

const fs = require('fs');
const session_generator = require('./index.js');
const getopts = require('getopts');
const request = require('request');
const { v4: uuidv4 } = require('uuid');

const options = getopts(process.argv.slice(2), {
  alias: {
    help: 'h',
    zip: '',
    'apk-url': '',
    'session-url': '',
    provider: ''
  },
  default: {
    zip: false,
    'apk-url': '',
    'session-url': '',
    provider: 'aws'
  }
});

console.log(options);

function help() {
  console.log(
    'usage: node cli.js --session-url=SESSION_URL [--zip] [--apk-url=APK_URL] [--provider=aws|perfecto]'
  );
  process.exit(0);
}

if (options.help || process.argv.length === 2) {
  help();
}

if (!options['session-url']) {
  help();
}

if (
  !options['provider'] ||
  ['aws', 'perfecto'].indexOf(options['provider']) === -1
) {
  help();
}

if (options['zip'] && !options['apk-url']) {
  help();
}

request.get(options['session-url'], function(err, res, body) {
  const json = JSON.parse(body);
  const sessionData = json.session;
  sessionData.options = '';

  if (options['zip']) {
    const tmpFilename = '/tmp/appium-generator-' + uuidv4() + '.zip';

    request.get(options['apk-url'], function(err, res, apkBuffer) {
      session_generator
        .saveGeneratedAppiumTest(
          'url.json',
          sessionData,
          apkBuffer,
          tmpFilename
        )
        .then(response => {
          const contents = fs.readFileSync(tmpFilename, null);
          process.stdout.write(contents);
          fs.unlinkSync(tmpFilename);
        });
    });
  }

  if (!options['zip']) {
    session_generator
      .generateAppiumIndexJs('url.json', sessionData)
      .then(response => {
        console.log(response);
      });
  }
});
