import {
  Input,
  Checkpoint,
  UserInteraction,
  ForegroundActivity,
  MetaEvent
} from 'session-types';

export const MAX_EVENTS = 10000;

export type TestLine =
  | { input: Input; sleep: number; ts: number }
  | { checkpoint: Checkpoint; sleep: number; ts: number }
  | { userInteraction: UserInteraction; sleep: number; ts: number }
  | { foregroundActivity: ForegroundActivity; sleep: number; ts: number };

export type TestLines = TestLine[];

export type AppiumTest = {
  incomplete: boolean;
  testLines: TestLines;
};

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
