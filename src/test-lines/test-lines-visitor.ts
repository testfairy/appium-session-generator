import { Provider, Platform } from './environment';
import { InputTestLine } from './input';
import { CheckpointTestLine } from './checkpoint';
import { UserInteractionTestLine } from './user-interaction';
import { ForegroundActivityTestLine } from './foreground-activity';

// Mandatory constructor for all test line visitors, must be conformed by the class object
export interface TestLineVisitorConstructor {
  new (visitor: TestLineVisitor | null): TestLineVisitor;
}

// Mandatory interface for all test line visitors, must be conformed by the instance object
export interface TestLineVisitor {
  /* These are visited once per code generation */
  visitInitialDocs(sessionUrl: string): void;
  visitImports(provider: Provider, sessionUrl: string): void;
  visitTestBegin(platform: Platform, provider: Provider): void;
  visitTestLimits(isComplete: boolean): void;
  visitAppLaunch(initialDelay: number): void;

  /* These are looped in a polymorphic array and called multiple times */
  visitInputTestLine(line: InputTestLine): void;
  visitCheckpointTestLine(line: CheckpointTestLine): void;
  visitUserInteractionTestLine(line: UserInteractionTestLine): void;
  visitForegroundActivityTestLine(line: ForegroundActivityTestLine): void;

  /* This is visited once per code generation */
  visitTestEnd(): void;
}

// Globals for each test suite
export type TestConfiguration = {
  platform: Platform;
  provider: Provider;
  sessionUrl: string;
  incomplete: boolean;
  initialDelay: number;
};

// Various types of test lines in the timeline
export type TestLine =
  | InputTestLine
  | CheckpointTestLine
  | UserInteractionTestLine
  | ForegroundActivityTestLine;

// Wrapper for test lines to accept visitors
export type TestLines = {
  testLines: TestLine[];
  accept(visitor: TestLineVisitor, config: TestConfiguration): void;
};
export const createTestLines = (testLines: TestLine[]): TestLines => {
  const result = {
    testLines,
    accept: (visitor: TestLineVisitor, config: TestConfiguration) => {
      visitor.visitInitialDocs(config.sessionUrl);
      visitor.visitImports(config.provider, config.sessionUrl);
      visitor.visitTestBegin(config.platform, config.provider);
      visitor.visitTestLimits(config.incomplete);
      visitor.visitAppLaunch(config.initialDelay);

      result.testLines.forEach((testLine: TestLine) => {
        testLine.accept(visitor);
      });

      visitor.visitTestEnd();
    }
  };

  return result;
};

// A small utility to build a javascript string by appending other strings
export type IndexJsBuilder = {
  script: string;
  append(str: string): void;
};
export const createIndexJsBuilder = (): IndexJsBuilder => {
  const result = {
    script: '',
    append(str: string): void {
      result.script += str;
    }
  };

  return result;
};

// A null-safe implementation for all test line visitors, derive from this as default
export const BaseTestLinesVisitor: TestLineVisitorConstructor = class BaseTestLinesVisitor
  implements TestLineVisitor {
  visitor: TestLineVisitor | null;

  constructor(visitor: TestLineVisitor | null) {
    this.visitor = visitor;
  }

  visitInitialDocs(sessionUrl: string) {
    this.visitor?.visitInitialDocs(sessionUrl);
  }
  visitImports(provider: Provider, sessionUrl: string) {
    this.visitor?.visitImports(provider, sessionUrl);
  }
  visitTestBegin(platform: Platform, provider: Provider) {
    this.visitor?.visitTestBegin(platform, provider);
  }
  visitTestLimits(isComplete: boolean) {
    this.visitor?.visitTestLimits(isComplete);
  }
  visitAppLaunch(initialDelay: number) {
    this.visitor?.visitAppLaunch(initialDelay);
  }
  visitInputTestLine(line: InputTestLine) {
    this.visitor?.visitInputTestLine(line);
  }
  visitCheckpointTestLine(line: CheckpointTestLine) {
    this.visitor?.visitCheckpointTestLine(line);
  }
  visitUserInteractionTestLine(line: UserInteractionTestLine) {
    this.visitor?.visitUserInteractionTestLine(line);
  }
  visitForegroundActivityTestLine(line: ForegroundActivityTestLine) {
    this.visitor?.visitForegroundActivityTestLine(line);
  }
  visitTestEnd() {
    this.visitor?.visitTestEnd();
  }
};

// A special implementation of test line visitor which can build strings as it visits test lines
export class TestLinesAppenderVisitor extends BaseTestLinesVisitor {
  indexJs: IndexJsBuilder;

  constructor(visitor: TestLineVisitor | null, indexJs: IndexJsBuilder) {
    super(visitor);

    this.indexJs = indexJs;
  }

  append(str: string): void {
    this.indexJs.append(str);
  }
}
