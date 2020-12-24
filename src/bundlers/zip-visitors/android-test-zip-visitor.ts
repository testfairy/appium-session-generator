import JSZip from 'jszip';
import { BaseTestZipVisitor } from '../test-zip-visitor';
import { ProviderConfiguration } from '../../environment-types';
import { SessionData } from '../../generator-types';
import { BinaryFile } from '../../file-system';

export class AndroidTestZipVisitor extends BaseTestZipVisitor {
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

    if (sessionData.platform !== '1') {
      const zipOptions = {
        binary: true,
        compression: 'STORE'
      };

      zip.file('session/app.apk', apkOrZipFile, zipOptions);
    }
  }
}
