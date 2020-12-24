import JSZip from 'jszip';
import ini from 'ini';
import { BaseTestZipVisitor } from '../test-zip-visitor';
import {
  ProviderConfiguration,
  SauceLabsConfiguration
} from '../../environment-types';
import { SessionData } from '../../generator-types';
import { BinaryFile } from '../../file-system';

export class SauceLabsTestZipVisitor extends BaseTestZipVisitor {
  visitTestZip(
    zip: JSZip,
    providerConfig: ProviderConfiguration,
    sessionData: SessionData,
    indexJs: string,
    apkOrZipFile: BinaryFile,
    outputFilePath: string
  ) {
    super.visitTestZip(
      zip,
      providerConfig,
      sessionData,
      indexJs,
      apkOrZipFile,
      outputFilePath
    );

    if (providerConfig.provider === 'saucelabs') {
      let sauceLabsConfig = providerConfig as SauceLabsConfiguration;

      zip.file(
        'saucelabs.ini',
        ini.encode({
          SauceLabs: {
            username: sauceLabsConfig.username,
            'access-key': sauceLabsConfig.accessKey,
            region: sauceLabsConfig.region,
            datacenter: sauceLabsConfig.datacenter,
            'device-name': sauceLabsConfig.deviceName,
            'device-orientation': sauceLabsConfig.deviceOrientation,
            'platform-version': sauceLabsConfig.platformVersion
          }
        })
      );
    }
  }
}
