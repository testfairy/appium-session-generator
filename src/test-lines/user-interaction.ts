// IMPORTANT : All further improvements into this file should be designed in a
// [platform, provider, framework]-agnostic manner!

import { UserInteraction } from '../session-types';
import { TestLineVisitor } from './test-lines-visitor';

export type UserInteractionTestLine = {
  userInteraction: UserInteraction;
  sleep: number;
  ts: number;
  accept(visitor: TestLineVisitor): void;
};
export const createUserInteractionTestLine = (
  userInteraction: UserInteraction,
  sleep: number,
  ts: number
): UserInteractionTestLine => {
  const result = {
    userInteraction,
    sleep,
    ts,
    accept: (visitor: TestLineVisitor) => {
      visitor.visitUserInteractionTestLine(result);
    }
  };

  return result;
};
