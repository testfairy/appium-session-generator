import { TestLinesAppenderVisitor } from '../../test-lines/test-lines-visitor';
import { Provider, Platform } from '../../environment-types';
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
    let generatedDartLine = `
////////////////////////////////////////////////////////////////////////////////////
// TestFairy : This is an automatically generated test case for a TestFairy session.
//
// You can inspect the session here:
//   ${sessionUrl}
//
////////////////////////////////////////////////////////////////////////////////////
`;
    this.append(generatedDartLine);

    super.visitInitialDocs(sessionUrl);
  }

  visitImports(provider: Provider, sessionUrl: string) {
    let generatedDartLine = `
import 'package:flutter_driver/flutter_driver.dart';
import 'package:test/test.dart';

import 'testfairy-interactions.dart';

const String sessionUrl = '${sessionUrl}';
`;
    this.append(generatedDartLine);

    super.visitImports(provider, sessionUrl);
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

    let generatedDartLine = `
void main() {
  String appName = "${sessionMetaData.appName}";
  String packageName = "${sessionMetaData.packageName}";

  group(appName + " - " + packageName, () {
    var cleanUp = () {};
    var drive = () async {
      var error = new StateError("FlutterDriver is not ready yet!");
      throw error;

      return await FlutterDriver
          .connect(); // Here for type inference (dart1-dart2 compatible syntax hack)
    };

    final timeout = Duration(seconds: 120);

    // Connect to the Flutter driver before running any tests
    setUpAll(() async {
      print("3 !");
      FlutterDriver driver = await FlutterDriver.connect();
      print("2 !");
      await driver.waitUntilFirstFrameRasterized();
      print("1 !");

      cleanUp = () {
        driver.close();

        cleanUp = () {};

        drive = () async {
          var error = new StateError("FlutterDriver is released!");
          throw error;

          return await FlutterDriver
              .connect(); // Here for type inference (dart1-dart2 compatible syntax hack)
        };
      };

      drive = () async {
        return driver;
      };
    });

    // Close the connection to the driver after the tests have completed
    tearDownAll(() async {
      cleanUp();
    });

    test("should simulate a session like " + sessionUrl, () async {
      var driver = await drive();
      var interactions = Interactions(driver);
`;
    this.append(generatedDartLine);

    super.visitTestBegin(platform, provider, sessionUrl, sessionMetaData);
  }

  visitTestLimits(isComplete: boolean) {
    if (isComplete) {
      let generatedDartLine = `      print("\\nTF : Tests exceed supported length, trailing actions will be truncated\\n");`;

      this.append(generatedDartLine);
    }

    super.visitTestLimits(isComplete);
  }

  visitAppLaunch(initialDelay: number) {
    let generatedDartLine = `
      // TF : TestFairy.begin(), time: 00:00
      print("\\nTF : TestFairy.begin(), time: 00:00\\n");
      await interactions.begin(${initialDelay}); // EDITME : Set up an initial delay, in milliseconds
`;
    this.append(generatedDartLine);

    super.visitAppLaunch(initialDelay);
  }

  /// @OTHER_VISITORS : between visitAppLaunch() and visitTestEnd(), other visitors
  /// will iterate through session events to generate various interaction and assertion
  /// lines

  visitTestEnd() {
    let generatedDartLine = `
    });
  });
}
`;
    this.append(generatedDartLine);

    super.visitTestEnd();
  }
}
