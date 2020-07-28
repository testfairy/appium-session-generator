import {
  SessionData,
  AppiumTest,
  TestLines,
  MAX_EVENTS
} from './generator-types';
import {
  sanitizeInput,
  correctScalingAndroid,
  addTimeString,
  sanitizeUserInteraction,
  ignoreSplashActivity,
  sanitizeForegroundActivity
} from './sanitizers';
import {
  Event,
  Input,
  Checkpoint,
  UserInteraction,
  ForegroundActivity
} from './session-types';

export const generateTestLines = (sessionData: SessionData): AppiumTest => {
  let inputIndex = 0;
  let checkpointIndex = 0;
  let userInteractionIndex = 0;
  let foregroundActivityIndex = 0;

  let inputs = (sessionData.events.inputEvents || [])
    .map(sanitizeInput)
    .map(correctScalingAndroid(sessionData.options, sessionData.events.meta))
    .map(addTimeString);
  let checkpoints = (sessionData.events.checkpoints || []).map(addTimeString);
  let userInteractions = (sessionData.events.userInteractions || [])
    .map(sanitizeUserInteraction(sessionData.events.userInteractions))
    .map(addTimeString);
  let foregroundActivities = (sessionData.events.foregroundActivities || [])
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

    if (testLines.length > 0) {
      const lastLine = testLines[testLines.length - 1];
      const sleep = Math.floor((currentLine.ts - lastLine.ts + 0.00001) * 1000);
      lastLine.sleep = Math.max(sleep, 0);
    }

    // Insert a test line for selected
    if (currentLine.ts !== Number.MAX_SAFE_INTEGER) {
      // Pushing lines with the wrappers below lets mustache select the necessary template by key lookup, check TestLine type for valid keys
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
          /*
          console.log(
            '----------------- currentForegroundActivity ----------------------'
          );
          console.log((currentLine as ForegroundActivity).name);
          console.log(testLines[testLines.length - 1]);
          */
          if (
            testLines.length > 1 &&
            (testLines[testLines.length - 1] as any).input &&
            (testLines[testLines.length - 1] as any).input.backButton
          ) {
            (currentLine as ForegroundActivity).isLastActionBackButton = true;
          }
          /*
          console.log(
            '----------------- ************************* ----------------------'
          );
          */

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
