import fs from 'fs';
import path from 'path';

import JSZip from 'jszip';

import { generateAppiumIndexJs, saveGeneratedAppiumTest } from '../src';
import { buildAppiumZipFile } from '../src/file-system';
import { SessionData } from '../src/generator-types';
import {
  Platform,
  PerfectoConfiguration,
  DeviceFarmConfiguration,
  ProviderConfiguration
} from '../src/test-lines/environment';

describe('generator tests', () => {
  const TIMEOUT_DURATION = 120000;
  jest.setTimeout(TIMEOUT_DURATION);

  console.log('Testing in node...');

  it('should create a zip file from template folder', async () => {
    let zip = await buildAppiumZipFile();

    // console.log(zip);

    expect(zip).toBeInstanceOf(JSZip);
  });

  ////////////////////////////////

  let perfectoConfig: PerfectoConfiguration = {
    provider: 'perfecto',
    host: 'partners',
    securityToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhMzY3MTc2My05NmQwLTRmMzktYjcwZS0yNjFlNjlmZjM1NzYifQ.eyJqdGkiOiJjZDRiZDc1ZC05ZWM1LTRjNTMtOWUwYS1jZmU4YTY0OTE3M2MiLCJleHAiOjAsIm5iZiI6MCwiaWF0IjoxNTk3MDYwMDUxLCJpc3MiOiJodHRwczovL2F1dGgucGVyZmVjdG9tb2JpbGUuY29tL2F1dGgvcmVhbG1zL3BhcnRuZXJzLXBlcmZlY3RvbW9iaWxlLWNvbSIsImF1ZCI6Imh0dHBzOi8vYXV0aC5wZXJmZWN0b21vYmlsZS5jb20vYXV0aC9yZWFsbXMvcGFydG5lcnMtcGVyZmVjdG9tb2JpbGUtY29tIiwic3ViIjoiYjNjYWQwMzQtNmE2NS00NjRmLWJjYTYtZTI0NTY3OTZmN2MyIiwidHlwIjoiT2ZmbGluZSIsImF6cCI6Im9mZmxpbmUtdG9rZW4tZ2VuZXJhdG9yIiwibm9uY2UiOiIyNWEwYmUxZC1iNGRmLTQzYWQtOTVhZC1jM2M4YWJjMzA0ODUiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJiNjFmMTBlNi00NGUyLTQ0MzUtOTcxMC0wODcwZmMzNTJkNTEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIn0.WlylNvBpwfc_ofIqLyioLhpajeDI_DIKtPTk3HzWKnU',
    deviceName: 'DF23FBEB'
  };

  let awsConfig: DeviceFarmConfiguration = { provider: 'aws' };

  const buildIndexJsGenerationTest = (
    providerConfig: ProviderConfiguration,
    platform: Platform
  ) => async () => {
    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = require('./session/sessionData-' +
      platform +
      '.json') as SessionData;
    let indexJs = await generateAppiumIndexJs(
      sessionUrl,
      sessionData,
      providerConfig
    );

    // console.log(indexJs);

    expect(indexJs).toBeDefined();
  };

  const buildAppiumZipGenerationTest = (
    providerConfig: ProviderConfiguration,
    platform: Platform
  ) => async () => {
    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = require('./session/sessionData-' +
      platform +
      '.json') as SessionData;
    let zipFilePath = path.resolve('appium.zip');

    await saveGeneratedAppiumTest(
      sessionUrl,
      providerConfig,
      sessionData,
      fs.readFileSync(
        path.resolve(
          './test/session/app.' + (platform === 'android' ? 'apk' : 'zip')
        )
      ),
      path.resolve('appium.zip')
    );

    let zipFileExists = await new Promise(function(resolve) {
      fs.exists(zipFilePath, function(exists) {
        resolve(exists);
      });
    });

    expect(zipFileExists).toBeTruthy();

    fs.unlinkSync(zipFilePath);
  };

  it(
    'should generate valid js for index.js on Android',
    buildIndexJsGenerationTest(awsConfig, 'android')
  );

  it(
    'should generate valid js for index.js on iOS',
    buildIndexJsGenerationTest(awsConfig, 'ios')
  );

  it(
    'should generate an appium.zip for AWS and save it to project root for a given session on Android',
    buildAppiumZipGenerationTest(awsConfig, 'android')
  );

  it(
    'should generate an appium.zip for AWS and save it to project root for a given session on iOS',
    buildAppiumZipGenerationTest(awsConfig, 'ios')
  );

  it(
    'should generate an appium.zip for Perfecto and save it to project root for a given session on Android',
    buildAppiumZipGenerationTest(perfectoConfig, 'android')
  );

  it(
    'should generate an appium.zip for Perfecto and save it to project root for a given session on iOS',
    buildAppiumZipGenerationTest(perfectoConfig, 'ios')
  );
});
