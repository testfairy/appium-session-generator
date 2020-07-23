import Mustache from 'mustache';
import {
  readTextFile,
  buildAppiumZipFile,
  saveZipFileAs,
  BinaryFile,
  isBrowser
} from './file-system';
import { SessionData, correctSessionDataFromBrowser } from 'generator-types';
import { generateTestLines as generateAndroid } from 'generator-android';
import { generateTestLines as generateIOS } from 'generator-iOS';

// Public API ////////////////////////////////////////////////////////

export const generateAppiumIndexJs = async (
  sessionUrl: string,
  sessionData: SessionData
): Promise<string> => {
  sessionData = correctSessionDataFromBrowser(sessionData);

  let isIOS = sessionData.platform === '1';
  let { testLines, incomplete } = isIOS
    ? generateIOS(sessionData)
    : generateAndroid(sessionData);

  let indexJs = Mustache.render(
    await readTextFile('template/index.js.mustache'),
    {
      testLines,
      sessionUrl,
      incomplete,
      isIOS,
      initialDelay: 5000
    }
  );

  return indexJs;
};

export const saveGeneratedAppiumTest = async (
  indexJs: string,
  sessionData: SessionData,
  apkOrZipFile: BinaryFile,
  outputFilePath: string
) => {
  sessionData = correctSessionDataFromBrowser(sessionData);

  let appiumZip = await buildAppiumZipFile();

  appiumZip.remove('.gitignore');
  appiumZip.remove('index.js.mustache');
  appiumZip.remove('session/app.apk');
  appiumZip.remove('session/app.zip');
  appiumZip.remove('session/README.md');
  appiumZip.remove('session/sessionData.json');

  appiumZip.file('index.js', indexJs);

  if (sessionData.platform === '1') {
    appiumZip.file('session/app.zip', apkOrZipFile);
  } else {
    appiumZip.file('session/app.apk', apkOrZipFile);
  }

  appiumZip.file('session/sessionData.json', JSON.stringify(sessionData));

  await saveZipFileAs(outputFilePath, appiumZip);
};

if (isBrowser()) {
  (window as any).generateAppiumIndexJs = generateAppiumIndexJs;
  (window as any).saveGeneratedAppiumTest = saveGeneratedAppiumTest;
}
