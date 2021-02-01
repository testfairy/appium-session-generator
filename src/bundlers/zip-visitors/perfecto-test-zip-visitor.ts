import JSZip from 'jszip';
import ini from 'ini';
import { BaseTestZipVisitor } from '../test-zip-visitor';
import {
  Framework,
  ProviderConfiguration,
  PerfectoConfiguration
} from '../../environment-types';
import { SessionData } from '../../generator-types';
import { BinaryFile } from '../../file-system';

export class PerfectoTestZipVisitor extends BaseTestZipVisitor {
  visitTestZip(
    zip: JSZip,
    framework: Framework,
    providerConfig: ProviderConfiguration,
    sessionData: SessionData,
    indexJs: string,
    apkOrZipFile: BinaryFile,
    outputFilePath: string
  ) {
    super.visitTestZip(
      zip,
      framework,
      providerConfig,
      sessionData,
      indexJs,
      apkOrZipFile,
      outputFilePath
    );

    if (providerConfig.provider === 'perfecto') {
      let perfectoConfig = providerConfig as PerfectoConfiguration;

      zip.file(
        'perfecto.ini',
        ini.encode({
          Perfecto: {
            host: perfectoConfig.host,
            'security-token': perfectoConfig.securityToken,
            'device-name': perfectoConfig.deviceName
          }
        })
      );
    }
  }
}
