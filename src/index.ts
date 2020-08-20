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
  PerfectoConfiguration
} from './test-lines/environment';
import { GeneratorConfiguration } from './test-lines/test-lines-visitor';
import { render } from './appium-js-renderer';
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
  let appiumTest = isIOS
    ? generateIOS(sessionData)
    : generateAndroid(sessionData); // TODO : Get rid of this by unifying generate*() functions in a platform-agnostic manner (they are already provider-agnostic)
  let config: GeneratorConfiguration = {
    appiumTest,
    platform: isIOS ? 'ios' : 'android',
    provider,
    sessionUrl,
    initialDelay: 5000
  };

  return render(config);
};

// Call ONLY this if you want to generate an appium project, it will generate its own index.js internally
export const saveGeneratedAppiumTest = async (
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
  appiumZip.remove('perfecto.ini');

  appiumZip.file(
    'index.js',
    generateAppiumIndexJs(sessionUrl, sessionData, providerConfig)
  );

  if (sessionData.platform === '1') {
    appiumZip.file('session/app.zip', apkOrZipFile);
  } else {
    appiumZip.file('session/app.apk', apkOrZipFile);
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

  appiumZip.file('session/sessionData.json', JSON.stringify(sessionData));

  await saveZipFileAs(outputFilePath, appiumZip);
};

if (isBrowser()) {
  (window as any).generateAppiumIndexJs = generateAppiumIndexJs;
  (window as any).saveGeneratedAppiumTest = saveGeneratedAppiumTest;
} else if (require.main === module) {
  cli(generateAppiumIndexJs, saveGeneratedAppiumTest); // Hack but works
}
