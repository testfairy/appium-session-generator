import Mustache from 'mustache';
import fs from 'fs';
import {
  Event,
  Input,
  Checkpoint,
  UserInteraction,
  ForegroundActivity
} from 'session-types';
import {
  sanitizeUserInteraction,
  ignoreSplashActivity,
  sanitizeInput,
  addTimeString,
  sanitizeForegroundActivity,
  correctScaling
} from 'sanitizers';

const MAX_EVENTS = 10000;

type TestLine =
  | { input: Input; sleep: number; ts: number }
  | { checkpoint: Checkpoint; sleep: number; ts: number }
  | { userInteraction: UserInteraction; sleep: number; ts: number }
  | { foregroundActivity: ForegroundActivity; sleep: number; ts: number };

type TestLines = TestLine[];

type AppiumTest = {
  incomplete: boolean;
  testLines: TestLines;
};

const generateTestLines = (sessionData: SessionData): AppiumTest => {
  let inputIndex = 0;
  let checkpointIndex = 0;
  let userInteractionIndex = 0;
  let foregroundActivityIndex = 0;

  let inputs = sessionData.input
    .map(sanitizeInput)
    .map(correctScaling(sessionData.options))
    .map(addTimeString);
  let checkpoints = sessionData.checkpoints.map(addTimeString);
  let userInteractions = sessionData.userInteractions
    .map(sanitizeUserInteraction)
    .map(addTimeString);
  let foregroundActivities = sessionData.foregroundActivities
    .filter(ignoreSplashActivity)
    .map(sanitizeForegroundActivity(sessionData.packageName))
    .map(addTimeString);

  let testLines: TestLines = [];

  let i = 0;
  while (
    i++ < MAX_EVENTS &&
    // While there are events to be processed
    (inputIndex < inputs.length ||
      checkpointIndex < checkpoints.length ||
      userInteractionIndex < userInteractions.length ||
      foregroundActivityIndex < foregroundActivities.length)
  ) {
    // Currently traversed events
    let currentInput: Event =
      inputIndex < inputs.length
        ? inputs[inputIndex]
        : { ts: Number.MAX_SAFE_INTEGER, timeString: '--:--' };
    let currentCheckpoint: Event =
      checkpointIndex < checkpoints.length
        ? checkpoints[checkpointIndex]
        : { ts: Number.MAX_SAFE_INTEGER, timeString: '--:--' };
    let currentUserInteraction: Event =
      userInteractionIndex < userInteractions.length
        ? userInteractions[userInteractionIndex]
        : { ts: Number.MAX_SAFE_INTEGER, timeString: '--:--' };
    let currentForegroundActivity: Event =
      foregroundActivityIndex < foregroundActivities.length
        ? foregroundActivities[foregroundActivityIndex]
        : { ts: Number.MAX_SAFE_INTEGER, timeString: '--:--' };

    // Choose the one with lowest ts, using following priorities
    let currentLine: Event = currentForegroundActivity;

    if (currentLine.ts >= currentCheckpoint.ts) {
      currentLine = currentCheckpoint;
    }

    if (currentLine.ts >= currentInput.ts) {
      currentLine = currentInput;
    }

    if (currentLine.ts >= currentUserInteraction.ts) {
      currentLine = currentUserInteraction;
    }
    /////////////

    // TODO : Add sleep duration to make use in mustache, use difference between current ts and the previous

    if (testLines.length > 0) {
      let lastLine = testLines[testLines.length - 1];
      lastLine.sleep = Math.max((currentLine.ts - lastLine.ts) * 1000, 0);
    }

    // Insert a test line for selected
    if (currentLine.ts !== Number.MAX_SAFE_INTEGER) {
      // Pushing lines with the wrappers below lets mustache select the necessary template by key lookup
      switch (currentLine) {
        case currentInput:
          testLines.push({
            input: currentLine as Input,
            sleep: 0,
            ts: currentLine.ts
          });
          inputIndex++;
          break;
        case currentCheckpoint:
          testLines.push({
            checkpoint: currentLine as Checkpoint,
            sleep: 0,
            ts: currentLine.ts
          });
          checkpointIndex++;
          break;
        case currentUserInteraction:
          testLines.push({
            userInteraction: currentLine as UserInteraction,
            sleep: 0,
            ts: currentLine.ts
          });
          userInteractionIndex++;
          break;
        case currentForegroundActivity:
          testLines.push({
            foregroundActivity: currentLine as ForegroundActivity,
            sleep: 0,
            ts: currentLine.ts
          });
          foregroundActivityIndex++;
          break;
      }
    } else {
      // If ts is INT_MAX, we've reached the end
      break;
    }
  }

  return { testLines, incomplete: i >= MAX_EVENTS };
};

// Public API ////////////////////////////////////////////////////////

export type SessionData = {
  packageName: string;
  options: string;
  input: Input[];
  checkpoints: Checkpoint[];
  userInteractions: UserInteraction[];
  foregroundActivities: ForegroundActivity[];
};

export const generateIndexJs = (
  sessionUrl: string,
  sessionData: SessionData
): string => {
  let { testLines, incomplete } = generateTestLines(sessionData);

  let indexJs = Mustache.render(
    fs.readFileSync(
      'template/index.js.mustache', // TODO : Figure out how to browserify this file read
      { encoding: 'utf8' }
    ),
    {
      testLines,
      sessionUrl,
      incomplete,
      initialDelay: 5000
    }
  );

  // TODO : Copy template folder
  //        Remove 'index.js.mustache' from the copy
  //        Add newly generated 'index.js' to the copy
  //        Remove 'session/README.md' from the copy
  //        Zip copy for deploy

  return indexJs; // TODO : Return ZIP file instead
};
