export type Android = 'android';
export type IOS = 'ios';
export type Platform = IOS | Android;

export type AWS = 'aws';
export type Perfecto = 'perfecto';
export type Provider = AWS | Perfecto;

export type DeviceFarmConfiguration = { provider: AWS };
export type PerfectoConfiguration = {
  provider: Perfecto;
  host: string;
  securityToken: string;
  deviceName: string;
};
export type ProviderConfiguration =
  | DeviceFarmConfiguration
  | PerfectoConfiguration;
