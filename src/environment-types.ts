// Platforms
export type Android = 'android';
export type IOS = 'ios';

export type Platform = IOS | Android;

// Providers
export type Local = 'local';
export type AWS = 'aws';
export type Perfecto = 'perfecto';
export type SauceLabs = 'saucelabs';

export type Provider = Local | AWS | Perfecto | SauceLabs;

// Frameworks
export type Appium = 'appium';
export type FlutterDriver = 'flutter-driver';
export type Espresso = 'espresso';
export type UIAutomator = 'uiautomator';
export type WebdriverIO = 'webdriverio';

export type Framework =
  | Appium
  | FlutterDriver
  | Espresso
  | UIAutomator
  | WebdriverIO;

// Provider configurations
export type LocalConfiguration = { provider: Local };
export type DeviceFarmConfiguration = { provider: AWS };
export type PerfectoConfiguration = {
  provider: Perfecto;
  host: string;
  securityToken: string;
  deviceName: string;
};
export type SauceLabsConfiguration = {
  provider: SauceLabs;
  username: string;
  accessKey: string;
  region: string;
  datacenter: string;
  deviceName: string;
  platformVersion: string;
  deviceOrientation: string;
};

export type ProviderConfiguration =
  | LocalConfiguration
  | DeviceFarmConfiguration
  | PerfectoConfiguration
  | SauceLabsConfiguration;
