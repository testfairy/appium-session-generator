import fs from 'fs';
import getopts from 'getopts';
import request from 'request';
import { v4 as uuidv4 } from 'uuid';
import {
  ProviderConfiguration,
  PerfectoConfiguration,
  DeviceFarmConfiguration
} from './test-lines/environment';

// These type erasures prevent circular dependencies between by cli.ts and index.ts
export type JsGenerator = Function;
export type ZipGenerator = Function;

export const cli = (
  generateAppiumIndexJs: JsGenerator,
  saveGeneratedAppiumTest: ZipGenerator
) => {
  const options = getopts(process.argv.slice(2), {
    alias: {
      help: 'h',
      zip: '',
      'apk-url': '',
      'session-url': '',
      provider: '',
      'perfecto-host': '',
      'perfecto-security-token': '',
      'perfecto-device-name': ''
    },
    default: {
      zip: false,
      'apk-url': '',
      'session-url': '',
      provider: 'aws',
      'perfecto-host': '',
      'perfecto-security-token': '',
      'perfecto-device-name': ''
    }
  });

  function help() {
    console.log(
      'usage: node cli.js --session-url=SESSION_URL [--zip] [--apk-url=APK_URL] [--provider=aws|perfecto] [--perfecto-host=PERFECTO_CLOUD_NAME] [--perfecto-security-token=PERFECTO_SECURITY_TOKEN] [--perfecto-device-name=PERFECTO_DEVICE_NAME]'
    );
    console.log('\n  i.e: node cli.js');
    process.exit(0);
  }

  if (options.help || process.argv.length === 2) {
    help();
  }

  if (!options['session-url']) {
    help();
  }

  let providerConfig: ProviderConfiguration | null = null;
  if (
    // Exit if provider is not recognized
    !options['provider'] ||
    ['aws', 'perfecto'].indexOf(options['provider']) === -1
  ) {
    help();
  } else if (
    // Exit if perfecto configuration is missing
    options['provider'] === 'perfecto' &&
    (!options['perfecto-host'] ||
      !options['perfecto-security-token'] ||
      !options['perfecto-device-name'])
  ) {
    help();
  } else {
    // Choose provider configuration
    let perfectoConfig: PerfectoConfiguration = {
      provider: 'perfecto',
      host: options['perfecto-host'],
      securityToken: options['perfecto-security-token'],
      deviceName: options['perfecto-device-name']
    };

    let awsConfig: DeviceFarmConfiguration = { provider: 'aws' };

    switch (options['provider']) {
      default:
      case 'aws':
        providerConfig = awsConfig;
        break;
      case 'perfecto':
        providerConfig = perfectoConfig;
        break;
    }
  }

  if (options['zip'] && !options['apk-url']) {
    help();
  }

  request.get(options['session-url'], function(
    _err: any,
    _res: any,
    body: string
  ) {
    const json = JSON.parse(body);
    const sessionData = json.session;
    sessionData.options = '';

    if (options['zip']) {
      const tmpFilename = '/tmp/appium-generator-' + uuidv4() + '.zip';

      request.get(options['apk-url'], function(
        _err: any,
        _res: any,
        apkBuffer: any
      ) {
        saveGeneratedAppiumTest(
          'TODO : pretty url',
          providerConfig as ProviderConfiguration,
          sessionData,
          apkBuffer,
          tmpFilename
        ).then((_response: any) => {
          const contents = fs.readFileSync(tmpFilename, null);
          process.stdout.write(contents);
          fs.unlinkSync(tmpFilename);
        });
      });
    }

    if (!options['zip']) {
      generateAppiumIndexJs(
        'TODO : pretty url',
        sessionData,
        providerConfig as ProviderConfiguration
      ).then((response: any) => {
        console.log(response);
      });
    }
  });
};
