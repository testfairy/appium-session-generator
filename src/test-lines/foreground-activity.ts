import { ForegroundActivity } from 'session-types';
import { TestLineVisitor } from './test-lines-visitor';

export type ForegroundActivityTestLine = {
  foregroundActivity: ForegroundActivity;
  sleep: number;
  ts: number;
  accept(visitor: TestLineVisitor): void;
};
export const createForegroundActivityTestLine = (
  foregroundActivity: ForegroundActivity,
  sleep: number,
  ts: number
): ForegroundActivityTestLine => {
  const result = {
    foregroundActivity,
    sleep,
    ts,
    accept: (visitor: TestLineVisitor) => {
      visitor.visitForegroundActivityTestLine(result);
    }
  };

  return result;
};
