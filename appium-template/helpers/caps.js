exports.android = {
  browserName: '',
  'appium-version': '1.15.1',
  platformName: 'Android',
  platformVersion: '10',
  autoGrantPermissions: true,
  noReset: false,
  fullReset: true,
  allowTestPackages: true,
  automationName: 'UiAutomator2',

  // Common
  deviceName: undefined, // Will be filled before test begins
  app: undefined, // Will be filled before test begins
  appWaitActivity: undefined, // Will be filled before test begins if necessary (only on Device Farm)
  securityToken: undefined // Will be filled before test begins if necessary (only on Perfecto)
};

exports.iOS = {
  'appium-version': '1.15.1',
  platformName: 'iOS',
  platformVersion: '12.2',
  deviceName: 'iPhone Simulator',
  autoAcceptAlerts: true,
  noReset: false,
  fullReset: false,
  automationName: 'XCUITest',
  app: undefined,
  securityToken: undefined, // Will be filled before test begins if necessary (only on Perfecto)
  username: undefined, // Will be filled before test begins if necessary (only on Sauce Labs)
  accessKey: undefined, // Will be filled before test begins if necessary (only on Sauce Labs)
  deviceOrientation: undefined // Will be filled before test begins if necessary (only on Sauce Labs)
};
