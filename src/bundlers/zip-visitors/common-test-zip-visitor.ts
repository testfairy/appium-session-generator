import JSZip from 'jszip';
import { BaseTestZipVisitor } from '../test-zip-visitor';
import { ProviderConfiguration } from '../../environment-types';
import { SessionData } from '../../generator-types';
import { BinaryFile } from '../../file-system';

export class CommonTestZipVisitor extends BaseTestZipVisitor {
  visitTestZip(
    zip: JSZip,
    providerConfig: ProviderConfiguration,
    sessionData: SessionData,
    indexJs: string,
    apkOrZipFile: BinaryFile,
    outputFilePath: string
  ) {
    zip.remove('.gitignore');
    zip.remove('session/app.apk');
    zip.remove('session/app.zip');
    zip.remove('session/README.md');
    zip.remove('session/sessionData.json');

    zip.file('index.js', indexJs);
    zip.file('session/sessionData.json', JSON.stringify(sessionData));

    super.visitTestZip(
      zip,
      providerConfig,
      sessionData,
      indexJs,
      apkOrZipFile,
      outputFilePath
    );
  }
}
