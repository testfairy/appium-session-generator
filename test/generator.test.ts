import fs from 'fs';
import path from 'path';

import JSZip from 'jszip';

import { generateAppiumIndexJs, saveGeneratedAppiumTest } from '../src';
import { buildAppiumZipFile } from '../src/file-system';
import { SessionData } from '../src/generator-types';

describe('generator tests', () => {
  const TIMEOUT_DURATION = 120000;
  jest.setTimeout(TIMEOUT_DURATION);

  console.log('Testing in node...');

  it('should create a zip file from template folder', async () => {
    let zip = await buildAppiumZipFile();

    // console.log(zip);

    expect(zip).toBeInstanceOf(JSZip);
  });

  it('should generate valid js for index.js on Android', async () => {
    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = require('./session/sessionData-Android.json') as SessionData;
    let indexJs = await generateAppiumIndexJs(sessionUrl, sessionData, 'aws');

    console.log(indexJs);

    expect(indexJs).toBeDefined();
  });

  it('should generate valid js for index.js on iOS', async () => {
    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = require('./session/sessionData-iOS.json') as SessionData;
    let indexJs = await generateAppiumIndexJs(sessionUrl, sessionData, 'aws');

    console.log(indexJs);

    expect(indexJs).toBeDefined();
  });

  it('should generate an appium.zip and save it to project root for a given session on Android', async () => {
    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = require('./session/sessionData-Android.json') as SessionData;
    let zipFilePath = path.resolve('appium.zip');

    await saveGeneratedAppiumTest(
      await generateAppiumIndexJs(sessionUrl, sessionData, 'aws'),
      sessionData,
      fs.readFileSync(path.resolve('./test/session/app.apk')),
      path.resolve('appium.zip')
    );

    let zipFileExists = await new Promise(function(resolve) {
      fs.exists(zipFilePath, function(exists) {
        resolve(exists);
      });
    });

    expect(zipFileExists).toBeTruthy();

    fs.unlinkSync(zipFilePath);
  });

  it('should generate an appium.zip and save it to project root for a given session on iOS', async () => {
    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = require('./session/sessionData-iOS.json') as SessionData;
    let zipFilePath = path.resolve('appium.zip');

    await saveGeneratedAppiumTest(
      await generateAppiumIndexJs(sessionUrl, sessionData, 'aws'),
      sessionData,
      fs.readFileSync(path.resolve('./test/session/app.zip')),
      path.resolve('appium.zip')
    );

    let zipFileExists = await new Promise(function(resolve) {
      fs.exists(zipFilePath, function(exists) {
        resolve(exists);
      });
    });

    expect(zipFileExists).toBeTruthy();

    fs.unlinkSync(zipFilePath);
  });
});
