// IMPORTANT : All further improvements into this file should be designed in a
// [platform, provider, framework]-agnostic manner!

import { Checkpoint } from '../session-types';
import { TestLineVisitor } from './test-lines-visitor';

export type CheckpointTestLine = {
  checkpoint: Checkpoint;
  sleep: number;
  ts: number;
  accept(visitor: TestLineVisitor): void;
};
export const createCheckpointTestLine = (
  checkpoint: Checkpoint,
  sleep: number,
  ts: number
): CheckpointTestLine => {
  const result = {
    checkpoint,
    sleep,
    ts,
    accept: (visitor: TestLineVisitor) => {
      visitor.visitCheckpointTestLine(result);
    }
  };

  return result;
};
