import {
  UserInteraction,
  ForegroundActivity,
  Input,
  Event,
  KeyInput,
  TouchInput,
  MetaEvent
} from './session-types';

export const addTimeString = (event: Event) => {
  let timeString = new Date(event.ts * 1000).toISOString().substr(11, 8);

  let hhMMSS = timeString.split(':');
  if (hhMMSS[0] === '00') {
    timeString = hhMMSS[1] + ':' + hhMMSS[2];
  }

  return {
    ...event,
    timeString
  };
};

export const sanitizeUserInteraction = (
  userInteraction: UserInteraction
): UserInteraction => {
  let interaction = { ...userInteraction }; // Copy interaction to modify

  if (interaction.className && interaction.className.length > 0) {
    delete interaction.accessibilityClassName; // Not needed if className is known
    delete interaction.viewTag;
  } else {
    delete interaction.className;

    let accessibilityClassName = interaction.accessibilityClassName;
    if (accessibilityClassName && accessibilityClassName.length > 0) {
      delete interaction.viewTag; // Not needed if accessibilityClassName is known
    } else {
      delete interaction.accessibilityClassName;
    }
  }

  if (!interaction.viewTag) {
    delete interaction.viewTag;
  }

  if (interaction.viewId) {
    let packageIdPair = interaction.viewId.split(':id/');

    if (packageIdPair.length === 2) {
      interaction.viewId = packageIdPair[1];
    }

    delete interaction.accessibilityClassName; // Not needed if viewId is known
    delete interaction.viewTag; // Not needed if viewId is known
    delete interaction.contentDescription; // Not needed if viewId is known
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
  };
};

export const correctScaling = (options: string, metaEvents: MetaEvent[]) => (
  input: Input
): Input => {
  let optionsArr = options.split(',');

  let inverseVideoScaling = 1;

  optionsArr.forEach(function(option: string) {
    if (option.indexOf('video-quality') === 0) {
      let keyValue = option.split('=');

      if (keyValue.length === 2 && keyValue[1] === 'medium') {
        inverseVideoScaling = 2;
      }
    }

    if (option.indexOf('video-rescale') === 0) {
      let keyValue = option.split('=');

      if (keyValue.length === 2) {
        let videoScaling = parseFloat(keyValue[1]);

        if (!isNaN(videoScaling)) {
          inverseVideoScaling = parseFloat((1 / videoScaling).toFixed(1));
        }
      }
    }
  });

  let statusBarHeight = 0;
  let foundDeviceConfiguration = metaEvents.find(function(
    meta: MetaEvent
  ): boolean {
    return meta.type === 37 && (meta as any).statusBarHeight;
  });

  if (foundDeviceConfiguration) {
    // TODO : Improve SDK to report whether this height should be subtracted due to translucency flag in activity
    statusBarHeight = (foundDeviceConfiguration as any).statusBarHeight;
  }

  let result = {
    ...input
  } as TouchInput;

  if (result.x && result.y) {
    result.x = result.x * inverseVideoScaling;
    result.y = Math.max(
      0,
      result.y * inverseVideoScaling + (statusBarHeight - statusBarHeight)
    );
  }

  return result;
};

export const sanitizeInput = (input: Input): Input => {
  return {
    ...input,
    touchDown: !(input as KeyInput).kc && input.act === 0,
    touchUp: !(input as KeyInput).kc && input.act === 1,
    touchMove: !(input as KeyInput).kc && input.act === 2,
    backButton: (input as KeyInput).kc === 4 && input.act === 1
  };
};

export const ignoreSplashActivity = (
  foregroundActivity: ForegroundActivity,
  index: number,
  activities: ForegroundActivity[]
): boolean => {
  if (
    index + 1 < activities.length &&
    foregroundActivity.ts <= 0 &&
    activities[index + 1].ts <= 0 - 1
  ) {
    return true; // Assume last activity with 0 ts is not splash
  }

  return foregroundActivity.ts >= 0;
};

export const sanitizeForegroundActivity = (packageName: string) => (
  foregroundActivity: ForegroundActivity
): ForegroundActivity => {
  return {
    ...foregroundActivity,
    name: foregroundActivity.name.replace(packageName, ''),
    isLastActionBackButton: false,
    ts: Math.max(0, foregroundActivity.ts)
  };
};
