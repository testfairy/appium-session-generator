import { TestLinesAppenderVisitor } from '../../test-lines/test-lines-visitor';
import { Provider, Platform } from '../../environment-types';
import { getTitleLines } from '../appium-js/test-creation-boilerplate';
import { SessionMetaData } from 'generator-types';

/// The code generated by this visitor can be deduced by reading visit methods
/// in this file from top to bottom.
///
/// The code generated by other visitors are placed inside a zone named @OTHER_VISITORS
/// in this file. In other words, this file itself will give you the entire outline
/// of the generated test suite. Navigate to other visitors when deeper inspection
/// of code generated by @OTHER_VISITORS is necessary.
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

  visitImports(provider: Provider, sessionUrl: string, splashScreen: string) {
    let generatedJsLine = `
require('colors');
const xmlEscape = require('xml-escape');

// Interaction helpers
const DEFAULT_ACTIVITY_WAIT_UNTIL = {
    timeout: 5000,
    timeoutMsg: 'Activity not found!'
};

const LONG_PRESS_ACTION = [
    'longPress',
    { action: 'wait', ms: 2000 },
    'release'
];

function activityIsShown(activity) {
    return () => driver.getCurrentActivity().indexOf(activity) !== -1;
}

function selectorWithAndroidViewId(viewId, text, viewClassName) {
    let idBundle = sessionData.packageName + ':id/' + viewId;
    let textMatch = '';

    if (text && text.length > 0 && idBundle !== text && viewClassName != "android.widget.ImageButton") {
        textMatch = '.textStartsWith("' + xmlEscape(text) + '")';
    }

    const selector = 'new UiSelector().resourceId("' + idBundle + '")' + textMatch

    return 'android=' + selector;
}

function selectorWithTextInView(text, viewClassName) {
    return 'android=new UiSelector().textStartsWith("' + xmlEscape(text) + '").className("' + viewClassName + '")';
}

function selectorWithAccessibilityId(accessibilityId) {
    return '~' + accessibilityId;
}

function selectorWithContentDescription(contentDescription) {
    // This is intentional and how webdriver.io works
    return selectorWithAccessibilityId(contentDescription);
}

// TestFairy session data
const sessionData = require('../../session/sessionData.json');
sessionData.sessionUrl = '${sessionUrl}';
`;

    this.append(generatedJsLine);

    super.visitImports(provider, sessionUrl, splashScreen);
  }

  visitTestBegin(
    platform: Platform,
    provider: Provider,
    sessionUrl: string,
    sessionMetaData: SessionMetaData
  ) {
    // platform: Platform, provider: Provider
    //
    // These arguments actually deserve their own visitor implementations
    // but right now their impact is small enough to right a bunch of if-else
    // statements in a single method

    let generatedJsLine = `
// Test spec
describe(${getTitleLines(platform)}, () => {
    it("should simulate a session like ".magenta + sessionData.sessionUrl.magenta.underline, () => {
`;
    this.append(generatedJsLine);

    super.visitTestBegin(platform, provider, sessionUrl, sessionMetaData);
  }

  visitTestLimits(isComplete: boolean) {
    if (isComplete) {
      let generatedJsLine = `        console.log("\\nTF : Tests exceed supported length, trailing actions will be truncated\\n".red.underline);`;

      this.append(generatedJsLine);
    }

    super.visitTestLimits(isComplete);
  }

  visitAppLaunch(initialDelay: number) {
    let generatedJsLine = `
        // TF : TestFairy.begin(), time: 00:00
        console.log("\\nTF : TestFairy.begin(), time: 00:00\\n".magenta.underline);
        driver.pause(${initialDelay}); // EDITME : Set up an initial delay, in milliseconds
`;
    this.append(generatedJsLine);

    super.visitAppLaunch(initialDelay);
  }

  /// @OTHER_VISITORS : between visitAppLaunch() and visitTestEnd(), other visitors
  /// will iterate through session events to generate various interaction and assertion
  /// lines

  visitTestEnd() {
    let generatedJsLine = `

    });
});
`;
    this.append(generatedJsLine);

    super.visitTestEnd();
  }
}