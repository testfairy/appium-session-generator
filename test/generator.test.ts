import fs from 'fs';
import path from 'path';

import JSZip from 'jszip';

import {
  // generateFlutterDriverAppTestDart,
  // generateAppiumIndexJs,
  saveGeneratedTest
} from '../src/index';
import { buildTemplateZipFile } from '../src/file-system';
import { SessionData } from '../src/generator-types';
import {
  Platform,
  Framework,
  ProviderConfiguration,
  LocalConfiguration,
  PerfectoConfiguration,
  SauceLabsConfiguration,
  DeviceFarmConfiguration
} from '../src/environment-types';

describe('generator tests', () => {
  const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes
  jest.setTimeout(TIMEOUT_DURATION);

  console.log('Testing in node...');

  it('should create a zip file from template folder', async () => {
    let zip = await buildTemplateZipFile('appium');

    // console.log(zip);

    expect(zip).toBeInstanceOf(JSZip);
  });

  ////////////////////////////////

  let localConfig: LocalConfiguration = { provider: 'local' };
  let awsConfig: DeviceFarmConfiguration = { provider: 'aws' };
  let perfectoConfig: PerfectoConfiguration = {
    provider: 'perfecto',
    host: 'partners',
    securityToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhMzY3MTc2My05NmQwLTRmMzktYjcwZS0yNjFlNjlmZjM1NzYifQ.eyJqdGkiOiJjZDRiZDc1ZC05ZWM1LTRjNTMtOWUwYS1jZmU4YTY0OTE3M2MiLCJleHAiOjAsIm5iZiI6MCwiaWF0IjoxNTk3MDYwMDUxLCJpc3MiOiJodHRwczovL2F1dGgucGVyZmVjdG9tb2JpbGUuY29tL2F1dGgvcmVhbG1zL3BhcnRuZXJzLXBlcmZlY3RvbW9iaWxlLWNvbSIsImF1ZCI6Imh0dHBzOi8vYXV0aC5wZXJmZWN0b21vYmlsZS5jb20vYXV0aC9yZWFsbXMvcGFydG5lcnMtcGVyZmVjdG9tb2JpbGUtY29tIiwic3ViIjoiYjNjYWQwMzQtNmE2NS00NjRmLWJjYTYtZTI0NTY3OTZmN2MyIiwidHlwIjoiT2ZmbGluZSIsImF6cCI6Im9mZmxpbmUtdG9rZW4tZ2VuZXJhdG9yIiwibm9uY2UiOiIyNWEwYmUxZC1iNGRmLTQzYWQtOTVhZC1jM2M4YWJjMzA0ODUiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJiNjFmMTBlNi00NGUyLTQ0MzUtOTcxMC0wODcwZmMzNTJkNTEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIn0.WlylNvBpwfc_ofIqLyioLhpajeDI_DIKtPTk3HzWKnU',
    deviceName: 'DF23FBEB'
  };
  let saucelabsAndroidConfig: SauceLabsConfiguration = {
    provider: 'saucelabs',
    username: 'diegoperini',
    accessKey: '9edfac26-509f-4153-9c97-decb827d56aa',
    region: 'eu-central-1',
    datacenter: 'ondemand.eu-central-1.saucelabs.com',
    deviceName: 'Samsung.*Galaxy.*',
    platformVersion: '8.1',
    deviceOrientation: 'portrait'
  };
  let saucelabsIOSConfig: SauceLabsConfiguration = {
    provider: 'saucelabs',
    username: 'diegoperini',
    accessKey: '9edfac26-509f-4153-9c97-decb827d56aa',
    region: 'eu-central-1',
    datacenter: 'ondemand.eu-central-1.saucelabs.com',
    deviceName: 'iPhone .*',
    platformVersion: '12.2',
    deviceOrientation: 'portrait'
  };

  // const buildAppiumIndexJsGenerationTest = (
  //   providerConfig: ProviderConfiguration,
  //   platform: Platform
  // ) => async () => {
  //   let sessionUrl =
  //     'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
  //   let sessionData = JSON.parse(
  //     fs.readFileSync(
  //       path.resolve('test/session/sessionData-' + platform + '.json'),
  //       { encoding: 'utf8' }
  //     )
  //   ) as SessionData;
  //   let indexJs = await generateAppiumIndexJs(
  //     sessionUrl,
  //     sessionData,
  //     providerConfig
  //   );

  //   console.log(indexJs);

  //   expect(indexJs).toBeDefined();
  // };

  const buildAppiumZipGenerationTest = (
    providerConfig: ProviderConfiguration,
    platform: Platform,
    framework: Framework = 'appium',
    deleteAfter: boolean = true
  ) => async () => {
    console.log(
      `Generating ${framework} tests for ${providerConfig.provider} on ${platform}`
    );

    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = JSON.parse(
      fs.readFileSync(
        path.resolve('test/session6/sessionData-' + platform + '.json'),
        { encoding: 'utf8' }
      )
    ) as SessionData;
    let zipFilePath = path.resolve('appium.zip');

    await saveGeneratedTest(
      framework,
      sessionUrl,
      providerConfig,
      sessionData,
      fs.readFileSync(
        path.resolve(
          'test/session6/app.' + (platform === 'android' ? 'apk' : 'zip')
        )
      ),
      zipFilePath
    );

    let zipFileExists = await new Promise(function(resolve) {
      fs.exists(zipFilePath, function(exists) {
        resolve(exists);
      });
    });

    expect(zipFileExists).toBeTruthy();

    if (deleteAfter) {
      fs.unlinkSync(zipFilePath);
    }
  };

  const buildFlutterDriveZipGenerationTest = (
    providerConfig: LocalConfiguration,
    platform: Platform,
    deleteAfter: boolean = true
  ) => async () => {
    console.log(
      `Generating flutter-driver tests for ${providerConfig.provider} on ${platform}`
    );

    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = JSON.parse(
      fs.readFileSync(
        // TODO : Use a representative flutter session
        path.resolve('test/session5/sessionData-' + platform + '.json'),
        { encoding: 'utf8' }
      )
    ) as SessionData;
    let zipFilePath = path.resolve('flutter-driver.zip');

    // Debug helper, have no other purpose
    // console.log(
    //   await generateFlutterDriverAppTestDart(
    //     sessionUrl,
    //     sessionData,
    //     providerConfig
    //   )
    // );

    await saveGeneratedTest(
      'flutter-driver',
      sessionUrl,
      providerConfig,
      sessionData,
      null, // Flutter doesn't need an apk/zip
      zipFilePath
    );

    let zipFileExists = await new Promise(function(resolve) {
      fs.exists(zipFilePath, function(exists) {
        resolve(exists);
      });
    });

    expect(zipFileExists).toBeTruthy();

    if (deleteAfter) {
      fs.unlinkSync(zipFilePath);
    }
  };

  // Generate test matrix
  (['Android', 'ios'] as Platform[]).forEach(platform => {
    [
      awsConfig,
      localConfig,
      perfectoConfig,
      saucelabsAndroidConfig,
      saucelabsIOSConfig
    ].forEach(providerConfig => {
      (['appium', 'webdriverio'] as Framework[]).forEach(framework => {
        if (
          platform === 'android' &&
          providerConfig.provider === 'saucelabs' &&
          providerConfig.deviceName.indexOf('iPhone') !== -1
        ) {
          return;
        }

        if (
          platform === 'ios' &&
          providerConfig.provider === 'saucelabs' &&
          providerConfig.deviceName.indexOf('iPhone') === -1
        ) {
          return;
        }

        // This line will run `count(platforms) * count(frameworks) * count(providers)` times
        it(
          `should generate valid ${framework} tests for ${providerConfig.provider} on ${platform}`,
          buildAppiumZipGenerationTest(providerConfig, platform, framework)
        );
      });
    });
  });

  it(
    'should generate an flutter-driver.zip for local and save it to project root for a given session on Android',
    buildFlutterDriveZipGenerationTest(localConfig, 'android')
  );

  it(
    'should generate an flutter-driver.zip for local and save it to project root for a given session on iOS',
    buildFlutterDriveZipGenerationTest(localConfig, 'ios')
  );

  //it(
  //  'Test Flutter manually',
  //  buildFlutterDriveZipGenerationTest(localConfig, 'android', false)
  //);

  // it(
  //   'Test manually',
  //   buildAppiumZipGenerationTest(localConfig, 'android', 'webdriverio', false)
  // );
});
