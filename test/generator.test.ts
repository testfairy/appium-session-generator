import fs from 'fs';
import path from 'path';
import http from 'http';

import JSZip from 'jszip';
import nodeStatic from 'node-static';

import { SessionData, generateIndexJs, saveGeneratedAppiumTest } from '../src';
import { buildAppiumZipFile } from '../src/file-system';

const BROWSER_TEST =
  process.env.TF_BROWSER_TEST && parseInt(process.env.TF_BROWSER_TEST) === 1;

describe('generator tests', () => {
  jest.setTimeout(60000);

  if (!BROWSER_TEST) {
    console.log('Testing in node...');

    it('should create a zip file from template folder', async () => {
      let zip = await buildAppiumZipFile();

      // console.log(zip);

      expect(zip).toBeInstanceOf(JSZip);
    });

    it('should generate valid js for index.js', async () => {
      let sessionUrl =
        'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
      let sessionData = require('./session/sessionData.json') as SessionData;
      let indexJs = await generateIndexJs(sessionUrl, sessionData);

      // console.log(indexJs);

      expect(indexJs).toBeDefined();
    });

    it('should generate an appium.zip and save it to project root for a given session', async () => {
      let sessionUrl =
        'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
      let sessionData = require('./session/sessionData.json') as SessionData;

      await saveGeneratedAppiumTest(
        await generateIndexJs(sessionUrl, sessionData),
        sessionData,
        fs.readFileSync(path.resolve('./test/session/app.apk'))
      );

      let zipFilePath = path.resolve('appium.zip');
      let zipFileExists = await new Promise(function(resolve) {
        fs.exists(zipFilePath, function(exists) {
          resolve(exists);
        });
      });

      expect(zipFileExists).toBeTruthy();

      fs.unlinkSync(zipFilePath);
    });
  } else {
    console.log('Testing in browser...');

    it('should open a browser and prompt save popup for appium.zip', async () => {
      let server = new nodeStatic.Server('./test/browser', { cache: 0 });

      await new Promise(function(resolve) {
        let timeout: any = undefined;

        let httpServer = http
          .createServer(function(request, response) {
            request
              .addListener('end', function() {
                // TODO : Close connection if html button click, resolve/reject accordingly
                // clearTimeout(timeout as NodeJS.Timeout);

                server.serve(request, response);
              })
              .resume();
          })
          .listen(8080);

        console.log(
          'Serving for 60 seconds on http://localhost:8080 - Finish the test manually in browser!'
        );

        timeout = setTimeout(function() {
          httpServer.close();
          resolve();
          clearTimeout(timeout as NodeJS.Timeout);
        }, 60000);
      });
    });
  }
});
