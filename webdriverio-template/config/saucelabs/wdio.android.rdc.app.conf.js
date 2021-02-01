const { config } = require('../wdio.shared.conf');

// ============
// Specs
// ============
config.specs = [
    './tests/specs/**/app*.spec.js',
];

// ============
// Capabilities
// ============
// For all capabilities please check
// http://appium.io/docs/en/writing-running-appium/caps/#general-capabilities
config.capabilities = [
    {
        // TestFairy generated capabilities
        browserName: '',
        'appium-version': '1.15.1',
        autoGrantPermissions: true,
        noReset: false,
        fullReset: true,
        allowTestPackages: true,
        platformName: 'Android',
        automationName: 'UiAutomator2',

        username: "gilm",
        accessKey: "e066b65b-28ac-4b12-bcf3-f8c85ef26907",
        deviceName: 'Samsung Galaxy S[8912].*',
        platformVersion: "10",
        app: 'sauce-storage:dc411da6-0493-4acf-a4bd-4917fef2a691.apk',

        // The reference to the app
        testobject_app_id: 'sauce-storage:dc411da6-0493-4acf-a4bd-4917fef2a691.apk',
        // The api key that has a reference to the app-project in the TO cloud
        testobject_api_key: "e066b65b-28ac-4b12-bcf3-f8c85ef26907",
        // The name of the test for in the cloud
        testobject_test_name: 'wdio-demo-app-test',
        // Some default settings
        // You can find more info in the TO Appium Basic Setup section

        idleTimeout: 180,
        maxInstances: 6,
        cacheId: new Date().getTime(),
        orientation: 'PORTRAIT',
        newCommandTimeout: 180,
        phoneOnly: true,
        tabletOnly: false,
    },
];

// =========================
// Sauce RDC specific config
// =========================
// The new version of WebdriverIO will:
// - automatically update the job status in the RDC cloud
// - automatically default to the US RDC cloud
config.services = ['sauce'];
// If you need to connect to the US RDC cloud comment the below line of code
config.region = 'eu';
// and uncomment the below line of code
// config.region = 'us';
// Increase for real device support
config.connectionRetryTimeout = 180000;

// This port was defined in the `wdio.shared.conf.js`
delete config.port;

exports.config = config;
