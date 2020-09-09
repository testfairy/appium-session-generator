import {
  GeneratorConfiguration,
  createIndexJsBuilder
} from './test-lines/test-lines-visitor';
import { CheckpointVisitor } from './test-lines-js-generation-visitors/checkpoint-visitor';
import { ForegroundActivityVisitor } from './test-lines-js-generation-visitors/foreground-activity-visitor';
import { InputAggregateVisitor } from './test-lines-js-generation-visitors/input-aggregate-visitor';
import { UserInteractionVisitor } from './test-lines-js-generation-visitors/user-interaction-visitor';
import { TestCaseCreationVisitor } from './test-lines-js-generation-visitors/test-case-creation-visitor';

export const render = (config: GeneratorConfiguration): string => {
  let indexJsBuilder = createIndexJsBuilder();

  let tests = new TestCaseCreationVisitor(null, indexJsBuilder);
  tests = new CheckpointVisitor(tests, indexJsBuilder);
  tests = new ForegroundActivityVisitor(tests, indexJsBuilder);

  if (config.platform === 'android') {
    tests = new UserInteractionVisitor(tests, indexJsBuilder);
  } else {
    tests = new InputAggregateVisitor(tests, indexJsBuilder);
  }

  config.appiumTest.testLines.accept(tests, config);

  return indexJsBuilder.script;
};
