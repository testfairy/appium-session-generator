import {} from 'generator-types';
import {
  TestLines,
  TestConfiguration,
  createIndexJsBuilder
} from 'test-lines/test-lines-visitor';
import { CheckpointVisitor } from 'test-lines-js-generation-visitors/checkpoint-visitor';
import { ForegroundActivityVisitor } from 'test-lines-js-generation-visitors/foreground-activity-visitor';
import { InputVisitor } from 'test-lines-js-generation-visitors/input-visitor';
import { UserInteractionVisitor } from 'test-lines-js-generation-visitors/user-interaction-visitor';
import { TestCaseCreationVisitor } from 'test-lines-js-generation-visitors/test-case-creation-visitor';

export const render = (
  testLines: TestLines,
  config: TestConfiguration
): string => {
  let indexJsBuilder = createIndexJsBuilder();

  let tests = new TestCaseCreationVisitor(null, indexJsBuilder);
  tests = new CheckpointVisitor(tests, indexJsBuilder);
  tests = new ForegroundActivityVisitor(tests, indexJsBuilder);
  tests = new InputVisitor(tests, indexJsBuilder);
  tests = new UserInteractionVisitor(tests, indexJsBuilder);

  testLines.accept(tests, config);

  return indexJsBuilder.script;
};
