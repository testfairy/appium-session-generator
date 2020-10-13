import { SessionData, Test, MAX_EVENTS } from './generator-types';
import { sanitizeInput, correctScalingIOS, addTimeString } from './sanitizers';
import { Event, Input, Checkpoint } from './session-types';
import { createTestLines } from './test-lines/test-lines-visitor';
import { createInputTestLine } from './test-lines/input';
import { createCheckpointTestLine } from './test-lines/checkpoint';

// TODO : This is a temporary code duplication to be able to experiment with iOS safely.
//        Eventually, the generator will be unified with the Android one.
export const generateTestLines = (sessionData: SessionData): Test => {
  let inputIndex = 0;
  let checkpointIndex = 0;

  let inputs = (sessionData.events.inputEvents || [])
    .map(sanitizeInput)
    .map(correctScalingIOS)
    .map(addTimeString);
  let checkpoints = (sessionData.events.checkpoints || []).map(addTimeString);

  let testLinesObject = createTestLines([]);
  let testLines = testLinesObject.testLines;

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
      // Pushing lines with the wrappers below lets them be visited by the code generator
      switch (currentLine) {
        case currentInput:
          testLines.push(
            createInputTestLine(currentLine as Input, 0, currentLine.ts)
          );
          inputIndex++;
          break;
        case currentCheckpoint:
          testLines.push(
            createCheckpointTestLine(
              currentLine as Checkpoint,
              0,
              currentLine.ts
            )
          );
          checkpointIndex++;
          break;
      }
    } else {
      // If ts is INT_MAX, we've reached the end
      break;
    }
  }

  return { testLines: testLinesObject, incomplete: i >= MAX_EVENTS };
};
