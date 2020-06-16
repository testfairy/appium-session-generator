exports.androidEmulator = {
  // appWaitActivity: 'EDITME', // EDITME : specify initial activity if necessary
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
