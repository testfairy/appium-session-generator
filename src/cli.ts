import fs from 'fs';
import getopts from 'getopts';
import request from 'request';
import { v4 as uuidv4 } from 'uuid';
import {
  ProviderConfiguration,
  PerfectoConfiguration,
  DeviceFarmConfiguration,
  LocalConfiguration,
  SauceLabsConfiguration,

  // These are just type-safe string literals for name consistency across the project
  Appium,
  FlutterDriver,
  Local,
  AWS,
  Perfecto,
  SauceLabs
} from './environment-types';

// These type erasures prevent circular dependencies between by cli.ts and index.ts
export type JsGenerator = Function;
export type DartGenerator = Function;
export type ZipGenerator = Function;

const getUrlWithoutParameters = (url: string): string => {
	const p = url.indexOf("?");
	return p > 0 ? url.substring(0, p) : url;
}

const getSessionUrlFromApiUrl = (url: string): string => {
	return getUrlWithoutParameters(url).replace("/api/1/projects/", "/projects/");
}

// CLI interface
export const cli = (
  // Arguments below are functions injected by index.ts to expose its module API to cli
  generateAppiumIndexJs: JsGenerator,
  generateFlutterDriverAppTestDart: DartGenerator,
  saveGeneratedTest: ZipGenerator
) => {
  const options = getopts(process.argv.slice(2), {
    alias: {
      help: 'h',
      zip: '',
      'apk-url': '',
      'session-url': '',
      provider: '',
      framework: '',
      'perfecto-host': '',
      'perfecto-security-token': '',
      'perfecto-device-name': '',
      'saucelabs-username': '',
      'saucelabs-access-key': '',
      'saucelabs-datacenter': '',
      'saucelabs-device-name': '',
      'saucelabs-device-orientation': '',
      'saucelabs-platform-version': ''
    },
    default: {
      zip: false,
      'apk-url': '',
      'session-url': '',
      provider: 'local',
      framework: 'appium',
      'perfecto-host': '',
      'perfecto-security-token': '',
      'perfecto-device-name': '',
      'saucelabs-username': '',
      'saucelabs-access-key': '',
      'saucelabs-datacenter': '',
      'saucelabs-device-name': '',
      'saucelabs-device-orientation': '',
      'saucelabs-platform-version': ''
    }
  });

  function help() {
    console.log('usage: node cli.js');
    console.log('    --session-url=SESSION_URL');
    console.log('    --zip');
    console.log('    --apk-url=APK_URL');
    console.log('    --provider=local|aws|perfecto|saucelabs');
    console.log('    --framework=appium|flutter-driver|espresso|uiautomator');
    console.log('    --perfecto-host=PERFECTO_CLOUD_NAME');
    console.log('    --perfecto-security-token=PERFECTO_SECURITY_TOKEN');
    console.log('    --perfecto-device-name=PERFECTO_DEVICE_NAME');
    console.log('    --saucelabs-username=SAUCELABS_USERNAME');
    console.log('    --saucelabs-access-key=SAUCELABS_ACCESS_KEY');
    console.log('    --saucelabs-datacenter=SAUCELABS_DATACENTER');
    console.log('    --saucelabs-region=SAUCELABS_REGION');
    console.log('    --saucelabs-device-name=SAUCELABS_DEVICE_NAME');
    console.log(
      '    --saucelabs-device-orientation=SAUCELABS_DEVICE_ORIENTATION'
    );
    console.log('    --saucelabs-platform-version=SAUCELABS_PLATFORM_VERSION');
    console.log('');

    process.exit(0);
  }

  // Help
  if (options.help || process.argv.length === 2) {
    help();
  }

  // The most important input for this tool to work, exit if missing
  if (!options['session-url']) {
    console.error('Missing --session-url');
    help();
  }

  // CLI input validation
  let providerArgumentMissing = !options['provider'];

  let providerNotSupported =
    [
      'local' as Local,
      'aws' as AWS,
      'perfecto' as Perfecto,
      'saucelabs' as SauceLabs
    ].indexOf(options['provider']) === -1;

  let frameworkNotSupported =
    ['appium' as Appium, 'flutter-driver' as FlutterDriver].indexOf(
      options['framework']
    ) === -1;

  let providerConfig: ProviderConfiguration | null = null;
  if (
    // Exit if provider is not recognized
    providerArgumentMissing ||
    providerNotSupported ||
    frameworkNotSupported
  ) {
    console.error('Framework ' + options['framework'] + ' is not supported');
    help();
  } else if (
    // Exit if perfecto configuration is missing
    options['provider'] === 'perfecto' &&
    (!options['perfecto-host'] ||
      !options['perfecto-security-token'] ||
      !options['perfecto-device-name'])
  ) {
    console.error(
      'Perfecto provider is missing host, security-token or device-name'
    );
    help();
  } else if (
    // Exit if perfecto configuration is missing
    options['provider'] === 'saucelabs' &&
    (!options['saucelabs-username'] ||
      !options['saucelabs-access-key'] ||
      !options['saucelabs-datacenter'] ||
      !options['saucelabs-device-name'] ||
      !options['saucelabs-device-orientation'] ||
      !options['saucelabs-platform-version'])
  ) {
    console.error(
      'Sauce Labs provider is missing username, access-key, datacenter, device-name, device-orientation or platform-version'
    );
    help();
  } else {
    // Choose provider configuration
    let localConfig: LocalConfiguration = { provider: 'local' };
    let awsConfig: DeviceFarmConfiguration = { provider: 'aws' };
    let perfectoConfig: PerfectoConfiguration = {
      provider: 'perfecto',
      host: options['perfecto-host'],
      securityToken: options['perfecto-security-token'],
      deviceName: options['perfecto-device-name']
    };
    let saucelabsConfig: SauceLabsConfiguration = {
      provider: 'saucelabs',
      username: options['saucelabs-username'],
      accessKey: options['saucelabs-access-key'],
      region: options['saucelabs-region'],
      datacenter: options['saucelabs-datacenter'],
      deviceName: options['saucelabs-device-name'],
      deviceOrientation: options['saucelabs-device-orientation'],
      platformVersion: options['saucelabs-platform-version']
    };

    switch (options['provider']) {
      default:
      case 'local':
        providerConfig = localConfig;
        break;
      case 'aws':
        providerConfig = awsConfig;
        break;
      case 'perfecto':
        providerConfig = perfectoConfig;
        break;
      case 'saucelabs':
        providerConfig = saucelabsConfig;
        break;
    }
  }

  if (options['zip'] && !options['apk-url']) {
    console.error('--zip requires --apk-url');
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

    const sessionUrl = getSessionUrlFromApiUrl(options['session-url']);

    if (options['zip']) {
      const tmpFilename = '/tmp/appium-generator-' + uuidv4() + '.zip';

      const requestOptions: any = { uri: options['apk-url'], encoding: null };
      request.get(requestOptions, function(
        _err: any,
        _res: any,
        apkBuffer: any
      ) {
        saveGeneratedTest(
          'appium',
          sessionUrl,
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
      let generate: Function | null = null;

      if (options['framework'] === 'appium') {
        generate = generateAppiumIndexJs;
      } else if (options['framework'] === 'flutter-driver') {
        generate = generateFlutterDriverAppTestDart;
      } else {
        generate = () => {
          throw new Error(options['framework'] + ' not supported!');
        };
      }

      generate(
        sessionUrl,
        sessionData,
        providerConfig as ProviderConfiguration
      ).then((response: any) => {
        console.log(response);
      });
    }
  });
};
