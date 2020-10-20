import {
  buildAppiumZipFile,
  saveZipFileAs,
  BinaryFile,
  isBrowser
} from './file-system';
import { SessionData, correctSessionDataFromBrowser } from './generator-types';
import { generateTestLines as generateAndroid } from './generator-android';
import { generateTestLines as generateIOS } from './generator-ios';
import {
  Provider,
  ProviderConfiguration,
  PerfectoConfiguration,
  SauceLabsConfiguration,
  Framework
} from './environment-types';
import { GeneratorConfiguration } from './test-lines/test-lines-visitor';
import { render as appiumRender } from './renderers/appium-js-renderer';
import { cli } from './cli';
import ini from 'ini';

// Public API ////////////////////////////////////////////////////////

// Call this to preview generated index.js, otherwise this is useless
export const generateAppiumIndexJs = async (
  sessionUrl: string,
  sessionData: SessionData,
  providerConfig: ProviderConfiguration
): Promise<string> => {
  sessionData = correctSessionDataFromBrowser(sessionData);

  let provider = providerConfig.provider as Provider;
  let isIOS = sessionData.platform === '1';
  let test = isIOS ? generateIOS(sessionData) : generateAndroid(sessionData); // TODO : Get rid of this by unifying generate*() functions in a platform-agnostic manner (they are already provider-agnostic)
  let config: GeneratorConfiguration = {
    test,
    platform: isIOS ? 'ios' : 'android',
    provider,
    sessionUrl,
    initialDelay: 5000
  };

  return appiumRender(config);
};

// Call ONLY this if you want to generate an appium javascript project, it will generate its own index.js internally
const saveGeneratedAppiumJsTest = async (
  sessionUrl: string,
  providerConfig: ProviderConfiguration,
  sessionData: SessionData,
  apkOrZipFile: BinaryFile,
  outputFilePath: string
) => {
  sessionData = correctSessionDataFromBrowser(sessionData);

  let appiumZip = await buildAppiumZipFile();

  appiumZip.remove('.gitignore');
  appiumZip.remove('session/app.apk');
  appiumZip.remove('session/app.zip');
  appiumZip.remove('session/README.md');
  appiumZip.remove('session/sessionData.json');

  appiumZip.file(
    'index.js',
    generateAppiumIndexJs(sessionUrl, sessionData, providerConfig)
  );

  const zipOptions = {
    binary: true,
    compression: 'STORE'
  };

  if (sessionData.platform === '1') {
    appiumZip.file('session/app.zip', apkOrZipFile, zipOptions);
  } else {
    appiumZip.file('session/app.apk', apkOrZipFile, zipOptions);
  }

  if (providerConfig.provider === 'perfecto') {
    let perfectoConfig = providerConfig as PerfectoConfiguration;

    appiumZip.file(
      'perfecto.ini',
      ini.encode({
        Perfecto: {
          host: perfectoConfig.host,
          'security-token': perfectoConfig.securityToken,
          'device-name': perfectoConfig.deviceName
        }
      })
    );
  }

  if (providerConfig.provider === 'saucelabs') {
    let perfectoConfig = providerConfig as SauceLabsConfiguration;

    appiumZip.file(
      'saucelabs.ini',
      ini.encode({
        SauceLabs: {
          username: perfectoConfig.username,
          'access-key': perfectoConfig.accessKey,
          region: perfectoConfig.region,
          datacenter: perfectoConfig.datacenter,
          'device-name': perfectoConfig.deviceName,
          'device-orientation': perfectoConfig.deviceOrientation,
          'platform-version': perfectoConfig.platformVersion
        }
      })
    );
  }

  appiumZip.file('session/sessionData.json', JSON.stringify(sessionData));

  await saveZipFileAs(outputFilePath, appiumZip);
};

// Main entry point to this library, 99% of the time you are here for this function
export const saveGeneratedTest = (
  framework: Framework,
  sessionUrl: string,
  providerConfig: ProviderConfiguration,
  sessionData: SessionData,
  apkOrZipFile: BinaryFile,
  outputFilePath: string
) => {
  switch (framework) {
    case 'appium':
      return saveGeneratedAppiumJsTest(
        sessionUrl,
        providerConfig,
        sessionData,
        apkOrZipFile,
        outputFilePath
      );
    default:
      throw new Error(framework + ' is not supported yet');
  }
};

if (isBrowser()) {
  (window as any).generateAppiumIndexJs = generateAppiumIndexJs;
  (window as any).saveGeneratedTest = saveGeneratedTest;
} else if (require.main === module) {
  cli(generateAppiumIndexJs, saveGeneratedTest); // Hack but works
}
