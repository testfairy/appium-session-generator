import { Framework, ProviderConfiguration } from '../environment-types';
import JSZip from 'jszip';
import { SessionData } from '../generator-types';
import { BinaryFile } from '../file-system';

export interface TestZipVisitor {
  visitTestZip(
    zip: JSZip,
    framework: Framework,
    providerConfig: ProviderConfiguration,
    sessionData: SessionData,
    indexJs: string,
    apkOrZipFile: BinaryFile,
    outputFilePath: string
  ): void;
}

// Wrapper for zip file to accept visitors
export type TestZip = {
  zip: JSZip;
  accept(visitor: TestZipVisitor): void;
};
export const createTestZip = (
  zip: JSZip,
  framework: Framework,
  providerConfig: ProviderConfiguration,
  sessionData: SessionData,
  indexJs: string,
  apkOrZipFile: BinaryFile,
  outputFilePath: string
): TestZip => {
  const result = {
    zip,
    accept: (visitor: TestZipVisitor) => {
      visitor.visitTestZip(
        zip,
        framework,
        providerConfig,
        sessionData,
        indexJs,
        apkOrZipFile,
        outputFilePath
      );
    }
  };

  return result;
};

// Mandatory constructor for all test line visitors, must be conformed by the class object
export interface TestZipVisitorConstructor {
  new (visitor: TestZipVisitor | null): TestZipVisitor;
}

/// A null-safe implementation for all test zip visitors, derive from this as default
///
export const BaseTestZipVisitor: TestZipVisitorConstructor = class BaseTestZipVisitor
  implements TestZipVisitor {
  visitor: TestZipVisitor | null;

  constructor(visitor: TestZipVisitor | null) {
    this.visitor = visitor;
  }

  visitTestZip(
    zip: JSZip,
    framework: Framework,
    providerConfig: ProviderConfiguration,
    sessionData: SessionData,
    indexJs: string,
    apkOrZipFile: BinaryFile,
    outputFilePath: string
  ) {
    this.visitor?.visitTestZip(
      zip,
      framework,
      providerConfig,
      sessionData,
      indexJs,
      apkOrZipFile,
      outputFilePath
    );
  }
};
