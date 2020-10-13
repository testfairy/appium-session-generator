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
    tests = new UserInteractionVisitor(tests, indexJsBuilder);
  } else {
    tests = new InputAggregateVisitor(tests, indexJsBuilder);
  }

  config.test.testLines.accept(tests, config);

  return indexJsBuilder.script;
};
