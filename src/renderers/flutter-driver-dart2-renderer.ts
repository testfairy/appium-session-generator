// IMPORTANT : All further improvements into this file should be designed in a
// way satisfying all combinations of [platform, provider, framework]. To achieve
// this, it is good practice to differentiate as late (deep) as possible in the
// visitor hierarchy. [platform, provider, framework] matrix is passed into all
// visitors via the `config` variable.

import {
  GeneratorConfiguration,
  createSourceCodeBuilder
} from '../test-lines/test-lines-visitor';
import { CheckpointVisitor } from './flutter-driver-dart2/checkpoint-visitor';
import { TestCaseCreationVisitor } from './flutter-driver-dart2/test-case-creation-visitor';
import { UserInteractionVisitor } from './flutter-driver-dart2/user-interaction-visitor';

export const render = (config: GeneratorConfiguration): string => {
  let appTestDartBuilder = createSourceCodeBuilder();

  let tests = new TestCaseCreationVisitor(null, appTestDartBuilder);
  tests = new CheckpointVisitor(tests, appTestDartBuilder);
  tests = new UserInteractionVisitor(tests, appTestDartBuilder);

  config.test.testLines.accept(tests, config);

  return appTestDartBuilder.script;
};
