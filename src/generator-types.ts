import {
  Input,
  Checkpoint,
  UserInteraction,
  ForegroundActivity,
  MetaEvent
} from './session-types';
import { TestLines } from 'test-lines/test-lines-visitor';

export const MAX_EVENTS = 10000;

// Test input
export type SessionData = {
  platform: string;
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

// Platform agnostic test suite, will be visited by visitors to generate
// platform aware javascript code
export type AppiumTest = {
  incomplete: boolean;
  testLines: TestLines;
};

// Helper for supporting different kinds of session data json formats
export const correctSessionDataFromBrowser = (
  sessionData: SessionData
): SessionData => {
  // Create a copy if already conforms to the SessionData type
  if (sessionData.events) {
    return JSON.parse(JSON.stringify(sessionData));
  }

  // Make it conform to the SessionData type we expect
  let newSessionData: SessionData = {
    platform: sessionData.platform,
    packageName: sessionData.packageName,
    options: sessionData.options,
    events: {
      inputEvents: (sessionData as any).input,
      checkpoints: (sessionData as any).checkpoints,
      userInteractions: (sessionData as any).userInteractions,
      foregroundActivities: (sessionData as any).foregroundActivities,
      meta: (sessionData as any).meta
    }
  };

  // Create a copy
  return JSON.parse(JSON.stringify(newSessionData));
};
