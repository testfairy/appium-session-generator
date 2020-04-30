import Mustache from 'mustache'
import fs from 'fs'

type Input = {
  x: number
  y: number
  act: number
  t: number
  ts: number
}

type Checkpoint = {
  name: string
  ts: number
}

type UserInteraction = {
  kind: number
  label: string
  ts: number
}

type ForegroundActivity = {
  name: string
  ts: number
}

type TimeStamped = {
  ts: number
}

type TestLine =
  | { input: Input }
  | { checkpoint: Checkpoint }
  | { userInteraction: UserInteraction }
  | { foregroundActivity: ForegroundActivity }

type TestLines = TestLine[]

const generateTestLines = (sessionData: SessionData): TestLines => {
  let inputIndex = 0
  let checkpointIndex = 0
  let userInteractionIndex = 0
  let foregroundActivityIndex = 0

  let testLines: TestLines = []

  while (
    // While there are events to be processed
    inputIndex < sessionData.input.length ||
    checkpointIndex < sessionData.checkpoints.length ||
    userInteractionIndex < sessionData.userInteractions.length ||
    foregroundActivityIndex < sessionData.foregroundActivities.length
  ) {
    // Currently traversed events
    let currentInput: TimeStamped =
      inputIndex < sessionData.input.length
        ? sessionData.input[inputIndex]
        : { ts: Number.MAX_SAFE_INTEGER }
    let currentCheckpoint: TimeStamped =
      checkpointIndex < sessionData.checkpoints.length
        ? sessionData.input[checkpointIndex]
        : { ts: Number.MAX_SAFE_INTEGER }
    let currentUserInteraction: TimeStamped =
      userInteractionIndex < sessionData.userInteractions.length
        ? sessionData.input[userInteractionIndex]
        : { ts: Number.MAX_SAFE_INTEGER }
    let currentForegroundActivity: TimeStamped =
      foregroundActivityIndex < sessionData.foregroundActivities.length
        ? sessionData.input[foregroundActivityIndex]
        : { ts: Number.MAX_SAFE_INTEGER }

    // Choose the one with lowest ts, using following priorities
    let currentLine: TimeStamped = currentForegroundActivity

    if (currentLine.ts > currentCheckpoint.ts) {
      currentLine = currentCheckpoint
    }

    if (currentLine.ts > currentUserInteraction.ts) {
      currentLine = currentUserInteraction
    }

    if (currentLine.ts > currentInput.ts) {
      currentLine = currentInput
    }
    /////////////

    // Insert a test line for selected
    if (currentLine.ts !== Number.MAX_SAFE_INTEGER) {
      switch (currentLine) {
        case currentInput:
          testLines.push({ input: currentInput as Input })
          inputIndex++
          break
        case currentCheckpoint:
          testLines.push({ checkpoint: currentInput as Checkpoint })
          checkpointIndex++
          break
        case currentUserInteraction:
          testLines.push({ userInteraction: currentInput as UserInteraction })
          userInteractionIndex++
          break
        case currentForegroundActivity:
          testLines.push({
            foregroundActivity: currentInput as ForegroundActivity
          })
          foregroundActivityIndex++
          break
      }
    } else {
      // If ts is INT_MAX, we've reached the end
      break
    }
  }

  return testLines
}

export type SessionData = {
  input: Input[]
  checkpoints: Checkpoint[]
  userInteractions: UserInteraction[]
  foregroundActivities: ForegroundActivity[]
}

export const generateIndexJs = (sessionData: SessionData): string => {
  let testLines = generateTestLines(sessionData)

  console.log(testLines)

  let indexJs = Mustache.render(
    fs.readFileSync(
      'template/index.js.mustache', // TODO : Figure out how to browserify this file read
      { encoding: 'utf8' }
    ),
    { testLines }
  )

  // TODO : Copy template folder
  //        Remove 'index.js.mustache' from the copy
  //        Add newly generated 'index.js' to the copy
  //        Remove 'session/README.md' from the copy
  //        Zip copy for deploy

  return indexJs // TODO : Return ZIP file instead
}
