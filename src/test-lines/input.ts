import { Input } from '../session-types';
import { TestLineVisitor } from './test-lines-visitor';

// Test lines
export type InputTestLine = {
  input: Input;
  sleep: number;
  ts: number;
  accept(visitor: TestLineVisitor): void;
};
export const createInputTestLine = (
  input: Input,
  sleep: number,
  ts: number
): InputTestLine => {
  const result = {
    input,
    sleep,
    ts,
    accept: (visitor: TestLineVisitor) => {
      visitor.visitInputTestLine(result);
    }
  };

  return result;
};
