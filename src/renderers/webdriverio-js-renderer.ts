// IMPORTANT : All further improvements into this file should be designed in a
// way satisfying all combinations of [platform, provider, framework]. To achieve
// this, it is good practice to differentiate as late (deep) as possible in the
// visitor hierarchy. [platform, provider, framework] matrix is passed into all
// visitors via the `config` variable.

import {
  GeneratorConfiguration,
  createSourceCodeBuilder
} from '../test-lines/test-lines-visitor';
import { CheckpointVisitor } from './webdriverio-js/checkpoint-visitor';
import { ForegroundActivityVisitor } from './webdriverio-js/foreground-activity-visitor';
import { UserInteractionVisitor } from './webdriverio-js/user-interaction-visitor';
import { TestCaseCreationVisitor } from './webdriverio-js/test-case-creation-visitor';

export const render = (config: GeneratorConfiguration): string => {
  let indexJsBuilder = createSourceCodeBuilder();

  let tests = new TestCaseCreationVisitor(null, indexJsBuilder);
  tests = new CheckpointVisitor(tests, indexJsBuilder);
  tests = new ForegroundActivityVisitor(tests, indexJsBuilder);

  // Compromise : This choice evolve quickly during development
  // and each time it does, we add a new visitor type. Thus, it
  // is easier to make the decision as close to outside as
  // possible for easy debugging. Eventually we may want to
  // move this if statement inside visitors to keep the visitor
  // chain flat.
  if (config.platform === 'android') {
    // Use ids, xpath (screen size independent)
    tests = new UserInteractionVisitor(tests, indexJsBuilder);
  } else {
    // TODO : implement after testbed app is ready
    // Use touch inputs (screen size dependent)
  }

  config.test.testLines.accept(tests, config);

  return indexJsBuilder.script;
};
