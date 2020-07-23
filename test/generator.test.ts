import fs from 'fs';
import path from 'path';
import http from 'http';

import JSZip from 'jszip';
import nodeStatic from 'node-static';
import opener from 'opener';
import enableDestroy from 'server-destroy';

import { generateAppiumIndexJs, saveGeneratedAppiumTest } from '../src';
import { buildAppiumZipFile, saveZipFileAs } from '../src/file-system';
import { SessionData } from '../src/generator-types';

const BROWSER_TEST =
  process.env.TF_BROWSER_TEST && parseInt(process.env.TF_BROWSER_TEST) === 1;

describe('generator tests', () => {
  const TIMEOUT_DURATION = 120000;
  jest.setTimeout(TIMEOUT_DURATION);

  if (!BROWSER_TEST) {
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
      let indexJs = await generateAppiumIndexJs(sessionUrl, sessionData);

      // console.log(indexJs);

      expect(indexJs).toBeDefined();
    });

    it('should generate valid js for index.js on iOS', async () => {
      let sessionUrl =
        'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
      let sessionData = require('./session/sessionData-iOS.json') as SessionData;
      let indexJs = await generateAppiumIndexJs(sessionUrl, sessionData);

      // console.log(indexJs);

      expect(indexJs).toBeDefined();
    });

    it('should generate an appium.zip and save it to project root for a given session on Android', async () => {
      let sessionUrl =
        'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
      let sessionData = require('./session/sessionData-Android.json') as SessionData;
      let zipFilePath = path.resolve('appium.zip');

      await saveGeneratedAppiumTest(
        await generateAppiumIndexJs(sessionUrl, sessionData),
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
        await generateAppiumIndexJs(sessionUrl, sessionData),
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

      // fs.unlinkSync(zipFilePath);
    });
  } else {
    console.log('Testing in browser...');

    const browserTest = (platform: string) => async () => {
      let templateZip = await buildAppiumZipFile();
      await saveZipFileAs('test/browser/s3/template.zip', templateZip);

      let server = new nodeStatic.Server('./test/browser', { cache: 0 });
      await new Promise(function(resolve, reject) {
        let timeout: any = undefined;

        let requests: http.IncomingMessage[] = [];
        let httpServer = http
          .createServer(function(request, response) {
            requests.push(request);

            request
              .addListener('end', function() {
                if (request.url) {
                  let url: string = request.url as string;

                  if (url.indexOf('SUCCESS') !== -1) {
                    console.log('Test user reported SUCCESS, closing server');

                    request.destroy();
                    httpServer.destroy();

                    resolve();
                    clearTimeout(timeout as NodeJS.Timeout);

                    return;
                  } else if (url.indexOf('FAIL') !== -1) {
                    request.destroy();
                    httpServer.destroy();

                    reject(
                      new Error('Test user reported FAIL, closing server')
                    );
                    clearTimeout(timeout as NodeJS.Timeout);

                    return;
                  }
                }

                server.serve(request, response);
              })
              .resume();
          })
          .listen(8080);

        enableDestroy(httpServer);

        console.log(
          'Serving for 60 seconds on http://localhost:8080/index-' +
            platform +
            '.html - Finish the test manually in browser!'
        );

        opener('http://localhost:8080/index-' + platform + '.html');

        timeout = setTimeout(function() {
          requests.forEach(function(request) {
            request.destroy();
          });
          httpServer.destroy();

          reject(
            new Error(
              'No response received from the user, failing and closing server'
            )
          );
        }, TIMEOUT_DURATION / 2);
      });
    };

    it(
      'should open a browser and prompt save popup for appium.zip for Android',
      browserTest('Android')
    );

    it(
      'should open a browser and prompt save popup for appium.zip for iOS',
      browserTest('iOS')
    );
  }
});
