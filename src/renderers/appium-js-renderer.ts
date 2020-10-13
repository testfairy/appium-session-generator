// IMPORTANT : All further improvements into this file should be designed in a
// way satisfying all combinations of [platform, provider, framework]. To achieve
// this, it is good practice to differentiate as late (deep) as possible in the
// visitor hierarchy. [platform, provider, framework] matrix is passed into all
// visitors via the `config` variable.

import {
  GeneratorConfiguration,
  createSourceCodeBuilder
} from '../test-lines/test-lines-visitor';
import { CheckpointVisitor } from './appium-js/checkpoint-visitor';
import { ForegroundActivityVisitor } from './appium-js/foreground-activity-visitor';
import { InputAggregateVisitor } from './appium-js/input-aggregate-visitor';
import { UserInteractionVisitor } from './appium-js/user-interaction-visitor';
import { TestCaseCreationVisitor } from './appium-js/test-case-creation-visitor';

export const render = (config: GeneratorConfiguration): string => {
  let indexJsBuilder = createSourceCodeBuilder();

  let tests = new TestCaseCreationVisitor(null, indexJsBuilder);
  tests = new CheckpointVisitor(tests, indexJsBuilder);
  tests = new ForegroundActivityVisitor(tests, indexJsBuilder);

  if (config.platform === 'android') {
    // Use ids, xpath (screen size independent)
    tests = new UserInteractionVisitor(tests, indexJsBuilder);
  } else {
    // Use touch inputs (screen size dependent)
    tests = new InputAggregateVisitor(tests, indexJsBuilder);
  }

  config.test.testLines.accept(tests, config);

  return indexJsBuilder.script;
};
