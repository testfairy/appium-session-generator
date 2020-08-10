import {
  buildAppiumZipFile,
  saveZipFileAs,
  BinaryFile,
  isBrowser
} from './file-system';
import { SessionData, correctSessionDataFromBrowser } from './generator-types';
import { generateTestLines as generateAndroid } from './generator-android';
import { generateTestLines as generateIOS } from './generator-ios';
import { Provider } from 'test-lines/environment';
import { TestConfiguration } from 'test-lines/test-lines-visitor';
import { render } from 'appium-js-renderer';
import ini from 'ini';

// Public API ////////////////////////////////////////////////////////

export type DeviceFarm = { provider: 'aws' };
export type Perfecto = {
  provider: 'perfecto';
  host: string;
  securityToken: string;
};
export type ProviderConfiguration = DeviceFarm | Perfecto;

export const generateAppiumIndexJs = async (
  sessionUrl: string,
  sessionData: SessionData,
  providerConfig: ProviderConfiguration
): Promise<string> => {
  sessionData = correctSessionDataFromBrowser(sessionData);

  let provider = providerConfig.provider as Provider;
  let isIOS = sessionData.platform === '1';
  let { testLines, incomplete } = isIOS
    ? generateIOS(sessionData)
    : generateAndroid(sessionData);
  let config: TestConfiguration = {
    platform: isIOS ? 'ios' : 'android',
    provider,
    sessionUrl,
    incomplete,
    initialDelay: 5000
  };

  return render(testLines, config);
};

export const saveGeneratedAppiumTest = async (
  indexJs: string,
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

  appiumZip.file('index.js', indexJs);

  if (sessionData.platform === '1') {
    appiumZip.file('session/app.zip', apkOrZipFile);
  } else {
    appiumZip.file('session/app.apk', apkOrZipFile);
  }

  if (providerConfig.provider === 'perfecto') {
    let perfectoConfig = providerConfig as Perfecto;

    appiumZip.file(
      'perfecto.ini',
      ini.encode({
        Perfecto: {
          host: perfectoConfig.host,
          'security-token': perfectoConfig.securityToken
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
}
