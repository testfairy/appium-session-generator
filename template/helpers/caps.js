exports.androidEmulator = {
  // appWaitActivity: 'EDITME', // EDITME : specify initial activity if necessary
  browserName: '',
  'appium-version': '1.6',
  platformName: 'Android',
  platformVersion: '10',

  // deviceName: 'Android Emulator', // TODO : AWS
  // deviceName: 'Android Emulator', // Local
  deviceName: 'R38M604TNBZ', // Perfecto

  autoGrantPermissions: true,
  noReset: false,
  fullReset: true,
  allowTestPackages: true,
  automationName: 'UiAutomator2',
  app: undefined, // Will be filed before test begins
  securityToken: undefined // Will be filed before test begins for Perfecto tests
};

exports.iOSSimulator = {
  'appium-version': '1.6',
  platformName: 'iOS',
  platformVersion: '12.2',
  deviceName: 'iPhone Simulator',
  autoAcceptAlerts: true,
  noReset: false,
  fullReset: false,
  automationName: 'XCUITest',
  app: undefined,
  securityToken: undefined // Will be filed before test begins for Perfecto tests
};
