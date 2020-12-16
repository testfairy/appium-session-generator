import {
  buildAppiumZipFile,
  saveZipFileAs,
  BinaryFile,
  isBrowser,
  buildFlutterDriverZipFile,
  rebundleZipFileWithNpmBundle
} from './file-system';
import { SessionData } from './generator-types';
import { generateTestLines as generateAndroid } from './generator-android';
import { generateTestLines as generateIOS } from './generator-ios';
import {
  Provider,
  ProviderConfiguration,
  Framework
} from './environment-types';
import { GeneratorConfiguration } from './test-lines/test-lines-visitor';
import { render as appiumRender } from './renderers/appium-js-renderer';
import { render as flutterRender } from './renderers/flutter-driver-dart2-renderer';
import { cli } from './cli';
import { correctSessionDataFromBrowser, extractMetaData } from './sanitizers';
import { createTestZip } from './bundlers/test-zip-visitor';
import { CommonTestZipVisitor } from './bundlers/zip-visitors/common-test-zip-visitor';
import { AndroidTestZipVisitor } from './bundlers/zip-visitors/android-test-zip-visitor';
import { IOSTestZipVisitor } from './bundlers/zip-visitors/ios-test-zip-visitor';
import { PerfectoTestZipVisitor } from './bundlers/zip-visitors/perfecto-test-zip-visitor';
import { SauceLabsTestZipVisitor } from './bundlers/zip-visitors/saucelabs-test-zip-visitor';

// Private API

const createRendererConfiguration = (
  sessionUrl: string,
  sessionData: SessionData,
  providerConfig: ProviderConfiguration
): GeneratorConfiguration => {
  sessionData = correctSessionDataFromBrowser(sessionData);

  let provider = providerConfig.provider as Provider;
  let isIOS = sessionData.platform === '1';
  let test = isIOS ? generateIOS(sessionData) : generateAndroid(sessionData); // TODO : Get rid of this by unifying generate*() functions in a platform-agnostic manner (they are already provider-agnostic)
  let config: GeneratorConfiguration = {
    test,
    platform: isIOS ? 'ios' : 'android',
    provider,
    sessionUrl,
    initialDelay: 5000,
    sessionMetaData: extractMetaData(sessionData)
  };

  return config;
};

// Public API ////////////////////////////////////////////////////////

// Call this to preview generated index.js, otherwise this is useless
export const generateAppiumIndexJs = async (
  sessionUrl: string,
  sessionData: SessionData,
  providerConfig: ProviderConfiguration
): Promise<string> => {
  return appiumRender(
    createRendererConfiguration(sessionUrl, sessionData, providerConfig)
  );
};

// Call this to preview generated app_test.dart, otherwise this is useless
export const generateFlutterDriverAppTestDart = async (
  sessionUrl: string,
  sessionData: SessionData,
  providerConfig: ProviderConfiguration
): Promise<string> => {
  return flutterRender(
    createRendererConfiguration(sessionUrl, sessionData, providerConfig)
  );
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

  let testZip = createTestZip(
    await buildAppiumZipFile(),
    providerConfig,
    sessionData,
    await generateAppiumIndexJs(sessionUrl, sessionData, providerConfig),
    apkOrZipFile,
    outputFilePath
  );

  let testZipVisitor = new CommonTestZipVisitor(null);
  testZipVisitor = new AndroidTestZipVisitor(testZipVisitor);
  testZipVisitor = new IOSTestZipVisitor(testZipVisitor);
  testZipVisitor = new PerfectoTestZipVisitor(testZipVisitor);
  testZipVisitor = new SauceLabsTestZipVisitor(testZipVisitor);

  testZip.accept(testZipVisitor);

  await saveZipFileAs(outputFilePath, testZip.zip);

  if (providerConfig.provider === 'aws') {
    await rebundleZipFileWithNpmBundle(outputFilePath);
  }
};

// Call ONLY this if you want to generate an Flutter Driver Dart2 project, it will generate its own app_test.dart internally
const saveGeneratedFlutterDriveDartTest = async (
  sessionUrl: string,
  providerConfig: ProviderConfiguration,
  sessionData: SessionData,
  outputFilePath: string
) => {
  sessionData = correctSessionDataFromBrowser(sessionData);

  let flutterDriverZip = await buildFlutterDriverZipFile();

  flutterDriverZip.file(
    'app_test.dart',
    generateFlutterDriverAppTestDart(sessionUrl, sessionData, providerConfig)
  );

  await saveZipFileAs(outputFilePath, flutterDriverZip);
};

// Main entry point to this library, 99% of the time you are here for this function
export const saveGeneratedTest = (
  framework: Framework,
  sessionUrl: string,
  providerConfig: ProviderConfiguration,
  sessionData: SessionData,
  apkOrZipFile: BinaryFile | null, // Flutter tests require source code access to main project thus ignores this build
  outputFilePath: string
) => {
  switch (framework) {
    case 'appium':
      if (apkOrZipFile === null) {
        throw new Error(
          'Appium needs a non-null apk or zip file to include it in the generated project.'
        );
      }

      return saveGeneratedAppiumJsTest(
        sessionUrl,
        providerConfig,
        sessionData,
        apkOrZipFile as BinaryFile, // Must be not null
        outputFilePath
      );
    case 'flutter-driver':
      if (providerConfig.provider !== 'local') {
        throw new Error(
          "Flutter Driver only supports 'local' provider, you asked for " +
            providerConfig.provider
        );
      }

      return saveGeneratedFlutterDriveDartTest(
        sessionUrl,
        providerConfig,
        sessionData,
        outputFilePath
      );
    default:
      throw new Error(framework + ' is not supported yet');
  }
};

if (isBrowser()) {
  (window as any).generateAppiumIndexJs = generateAppiumIndexJs;
  (window as any).generateFlutterDriverAppTestDart = generateFlutterDriverAppTestDart;
  (window as any).saveGeneratedTest = saveGeneratedTest;
} else if (require.main === module) {
  cli(
    generateAppiumIndexJs,
    generateFlutterDriverAppTestDart,
    saveGeneratedTest
  ); // Hack but works
}
