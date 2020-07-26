import {
  SessionData,
  AppiumTest,
  TestLines,
  MAX_EVENTS
} from './generator-types';
import { sanitizeInput, correctScalingIOS, addTimeString } from './sanitizers';
import { Event, Input, Checkpoint } from './session-types';

export const generateTestLines = (sessionData: SessionData): AppiumTest => {
  let inputIndex = 0;
  let checkpointIndex = 0;

  let inputs = (sessionData.events.inputEvents || [])
    .map(sanitizeInput)
    .map(correctScalingIOS)
    .map(addTimeString);
  let checkpoints = (sessionData.events.checkpoints || []).map(addTimeString);

  let testLines: TestLines = [];

  let i = 0;
  while (
    i++ < MAX_EVENTS &&
    // While there are events to be processed
    (inputIndex < inputs.length || checkpointIndex < checkpoints.length)
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

    // Choose the one with lowest ts, using following priorities
    let currentLine: Event = currentCheckpoint;

    if (currentLine.ts >= currentInput.ts) {
      currentLine = currentInput;
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
      }
    } else {
      // If ts is INT_MAX, we've reached the end
      break;
    }
  }

  return { testLines, incomplete: i >= MAX_EVENTS };
};
