import {
  UserInteraction,
  ForegroundActivity,
  Input,
  Event,
  KeyInput
} from 'session-types'

export const sanitizeUserInteraction = (
  userInteraction: UserInteraction
): UserInteraction => {
  let interaction = { ...userInteraction } // Copy interaction to modify

  if (interaction.className && interaction.className.length > 0) {
    delete interaction.accessibilityClassName // Not needed if className is known
    delete interaction.viewTag
  } else {
    delete interaction.className

    let accessibilityClassName = interaction.accessibilityClassName
    if (accessibilityClassName && accessibilityClassName.length > 0) {
      delete interaction.viewTag // Not needed if accessibilityClassName is known
    } else {
      delete interaction.accessibilityClassName
    }
  }

  if (!interaction.viewTag) {
    delete interaction.viewTag
  }

  if (interaction.viewId) {
    let packageIdPair = interaction.viewId.split(':id/')

    if (packageIdPair.length === 2) {
      interaction.viewId = packageIdPair[1]
    }

    delete interaction.className // Not needed if viewId is known
    delete interaction.accessibilityClassName // Not needed if viewId is known
    delete interaction.viewTag // Not needed if viewId is known
    delete interaction.label // Not needed if viewId is known
  }

  return {
    ...interaction,
    swipe: interaction.kind === 0,
    buttonPressed: interaction.kind === 1,
    tableCellPressed: interaction.kind === 2, // TODO : Android SDK doesn't send this yet
    checkpointReached: interaction.kind === 3, // TODO : Android SDK doesn't send this yet
    dialogAppeared: interaction.kind === 5, // TODO : Android SDK doesn't send this yet
    dialogDismissed: interaction.kind === 6, // TODO : Android SDK doesn't send this yet
    textFieldLostFocus: interaction.kind === 7, // TODO : Android SDK doesn't send this yet
    buttonLongPressed: interaction.kind === 8,
    buttonDoublePressed: interaction.kind === 9
  }
}

export const addTimeString = (event: Event) => {
  let timeString = new Date(event.ts * 1000).toISOString().substr(11, 8)

  let hhMMSS = timeString.split(':')
  if (hhMMSS[0] === '00') {
    timeString = hhMMSS[1] + ':' + hhMMSS[2]
  }

  return {
    ...event,
    timeString
  }
}

export const sanitizeInput = (input: Input): Input => {
  return {
    ...input,
    touchDown: !(input as KeyInput).kc && input.act === 0,
    touchUp: !(input as KeyInput).kc && input.act === 1,
    touchMove: !(input as KeyInput).kc && input.act === 2,
    backButton: (input as KeyInput).kc === 4 && input.act === 0
  }
}

export const ignoreSplashActivity = (
  foregroundActivity: ForegroundActivity,
  index: number,
  activities: ForegroundActivity[]
): boolean => {
  if (
    index + 1 < activities.length &&
    foregroundActivity.ts === -1 &&
    activities[index + 1].ts !== -1
  ) {
    return true // Assume last activity with -1 ts is not splash
  }

  return foregroundActivity.ts >= 0
}

export const sanitizeForegroundActivity = (packageName: string) => (
  foregroundActivity: ForegroundActivity
): ForegroundActivity => {
  return {
    ...foregroundActivity,
    name: foregroundActivity.name.replace(packageName, '')
  }
}
