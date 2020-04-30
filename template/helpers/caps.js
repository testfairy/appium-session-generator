exports.iosPhone = {
  browserName: '',
  'appium-version': '1.6',
  platformName: 'iOS',
  platformVersion: '10.1',
  deviceName: 'iPhone 5s',
  app: undefined // Will be filed before test begins
};

exports.iosSimulator = {
  browserName: '',
  'appium-version': '1.6',
  platformName: 'iOS',
  platformVersion: '10.1',
  deviceName: 'iPhone Simulator',
  app: undefined // Will be filed before test begins
};

exports.androidEmulator = {
  browserName: '',
  'appium-version': '1.6',
  platformName: 'Android',
  platformVersion: '10',
  deviceName: 'Android Emulator',
  autoGrantPermissions: true,
  noReset: false,
  fullReset: true,
  allowTestPackages: true,
  automationName: 'UiAutomator2',
  app: undefined // Will be filed before test begins
};
