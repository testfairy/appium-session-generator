import { SessionData, generateIndexJs } from '../src';

describe('generator tests', () => {
  it('should generate valid js for index.js', async () => {
    let sessionUrl =
      'https://automatic-tests.testfairy.com/projects/6852543-drawmeafairy/builds/9228222/sessions/4450931346';
    let sessionData = require('./session/sessionData.json') as SessionData;
    console.log(await generateIndexJs(sessionUrl, sessionData));
    // generateIndexJs(sessionUrl, sessionData)
  });

  // TODO : Add browser test by creating a temp http server and serving a html page which depends on this library
});
