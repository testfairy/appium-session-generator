import JSZip from 'jszip';
import { BaseTestZipVisitor } from '../test-zip-visitor';
import { Framework, ProviderConfiguration } from '../../environment-types';
import { SessionData } from '../../generator-types';
import { BinaryFile } from '../../file-system';

export class AppiumTestZipVisitor extends BaseTestZipVisitor {
  visitTestZip(
    zip: JSZip,
    framework: Framework,
    providerConfig: ProviderConfiguration,
    sessionData: SessionData,
    indexJs: string,
    apkOrZipFile: BinaryFile,
    outputFilePath: string
  ) {
    if (framework === 'appium') {
      zip.remove('.gitignore');
      zip.remove('session/app.apk');
      zip.remove('session/app.zip');
      zip.remove('session/README.md');
      zip.remove('session/sessionData.json');

      zip.file('index.js', indexJs);
      zip.file('session/sessionData.json', JSON.stringify(sessionData));
    }

    super.visitTestZip(
      zip,
      framework,
      providerConfig,
      sessionData,
      indexJs,
      apkOrZipFile,
      outputFilePath
    );
  }
}
