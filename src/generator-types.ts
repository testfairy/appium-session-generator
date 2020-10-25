import { Platform } from 'environment-types';
import {
  Input,
  Checkpoint,
  UserInteraction,
  ForegroundActivity,
  MetaEvent
} from './session-types';
import { TestLines } from './test-lines/test-lines-visitor';

export const MAX_EVENTS = 10000;

// Test input
export type SessionData = {
  appName: string;
  platform: string; // This is '0' or '1', similar to TestFairy db
  packageName: string;
  options: string;
  events: {
    inputEvents: Input[];
    checkpoints: Checkpoint[];
    userInteractions: UserInteraction[];
    foregroundActivities: ForegroundActivity[];
    meta: MetaEvent[];
  };
};

// Test input without the events, sanitized
export type SessionMetaData = {
  appName: string;
  platform: Platform; // This is 'ios' or 'android', to be type-safe
  packageName: string;
  options: string;
  events: {
    meta: MetaEvent[];
  };
};

// Totally agnostic test suite, will be visited by visitors
// to generate [platform, provider, framework]-aware test code
export type Test = {
  incomplete: boolean;
  testLines: TestLines;
};
