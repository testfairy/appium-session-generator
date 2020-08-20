import { TestLinesAppenderVisitor } from '../test-lines/test-lines-visitor';
import { Provider, Platform } from '../test-lines/environment';

export class TestCaseCreationVisitor extends TestLinesAppenderVisitor {
  visitInitialDocs(sessionUrl: string) {
    let generatedJsLine = `
"use strict";

////////////////////////////////////////////////////////////////////////////////////
// TestFairy : This is an automatically generated test case for a TestFairy session.
//
// You can inspect the session here:
//   ${sessionUrl}
//
////////////////////////////////////////////////////////////////////////////////////

`;
    this.append(generatedJsLine);

    super.visitInitialDocs(sessionUrl);
  }

  visitImports(provider: Provider, sessionUrl: string) {
    let generatedJsLine = `
// Helpers (app agnostic)
var tester = require("./helpers/setup");
var serverConfig = require('./helpers/appium-server').${provider};
var interactions = require("./helpers/testfairy-interactions");
var wd = require("wd");
var _ = require('underscore');
var colors = require('colors');
var capabilities = require("./helpers/caps");

// Session data (app specific)
var sessionData = require('./session/sessionData.json');
sessionData.sessionUrl = '${sessionUrl}';
`;
    if (provider === 'perfecto') {
      generatedJsLine += `
var perfectoIni = tester.findPerfectoIni();
capabilities.iOS.securityToken = perfectoIni.securityToken;
capabilities.android.securityToken = perfectoIni.securityToken;
capabilities.iOS.deviceName = perfectoIni.deviceName;
capabilities.android.deviceName = perfectoIni.deviceName;
`;
    }

    this.append(generatedJsLine);

    super.visitImports(provider, sessionUrl);
  }

  visitTestBegin(platform: Platform, provider: Provider) {
    // platform: Platform, provider: Provider
    //
    // These arguments actually deserve their own visitor implementations
    // but right now their impact is small enough to right a bunch of if-else
    // statements in a single method

    let titleIOS = `(sessionData.appName + " - iOS Test generated by TestFairy\\n").magenta`;
    let titleAndroid = `(sessionData.appName + " - Android Test generated by TestFairy\\n").magenta`;
    let title = platform === 'ios' ? titleIOS : titleAndroid;

    let deviceIOS = `var desired = _.clone(capabilities.iOS);
    desired.app = __dirname + "/session/app.zip";`;
    let deviceAndroid = `var desired = _.clone(capabilities.android);
    desired.app = __dirname + "/session/app.apk";`;
    let device = platform === 'ios' ? deviceIOS : deviceAndroid;
    device += `
    desired.appPackage = sessionData.packageName;`;

    let driverSetup = `driver = wd.promiseChainRemote(serverConfig);`;
    let init = `return driver.init(desired).setImplicitWaitTimeout(5000);`;

    if (provider === 'perfecto') {
      // TODO : Change 'http://' below to 'https://' once wd is updated on npm
      driverSetup = `
    desired.app = await tester.uploadAppToPerfecto(serverConfig.host, desired.securityToken, desired.app);
    driver = wd.promiseChainRemote("http://" + serverConfig.host + "/nexperience/perfectomobile/wd/hub/fast");`;

      init = `return driver.init(tester.filterPerfectoCaps(desired)).setImplicitWaitTimeout(5000);`;
    }

    let generatedJsLine = `
// App test suite
describe(
  ${title},
  function () {
  this.timeout(60 * 60 * 1000); // 1 hour

  var driver;

  before(async function () {
    ${device}
    ${driverSetup}
    require("./helpers/logging").configure(driver);

    interactions.packageName = sessionData.packageName;
    interactions.driver = driver;

    ${init}
  });

  after(function () {
    return driver.quit();
  });

  it("should simulate a session like ".magenta + sessionData.sessionUrl.magenta.underline, async function () {
`;
    this.append(generatedJsLine);

    super.visitTestBegin(platform, provider);
  }

  visitTestLimits(isComplete: boolean) {
    if (isComplete) {
      let generatedJsLine = `    console.log("\\nTF : Tests exceed supported length, trailing actions will be truncated\\n".red.underline);`;

      this.append(generatedJsLine);
    }

    super.visitTestLimits(isComplete);
  }

  visitAppLaunch(initialDelay: number) {
    let generatedJsLine = `
    // TF : TestFairy.begin(), time: 00:00
    console.log("\\nTF : TestFairy.begin(), time: 00:00\\n".magenta.underline);
    await interactions.begin(${initialDelay}); // EDITME : Set up an initial delay, in milis
`;
    this.append(generatedJsLine);

    super.visitAppLaunch(initialDelay);
  }

  visitTestEnd() {
    let generatedJsLine = `

    return tester.assert.isFulfilled(driver.sleep(5000));
  });
});
`;
    this.append(generatedJsLine);

    super.visitTestEnd();
  }
}
