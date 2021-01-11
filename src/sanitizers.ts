import { SessionData, SessionMetaData } from './generator-types';
import jsStringEscape from 'js-string-escape';
import {
  UserInteraction,
  ForegroundActivity,
  Input,
  Event,
  KeyInput,
  TouchInput,
  MetaEvent,
  Locator
} from './session-types';

const escape = (str: string | null | undefined): string => {
  if (str) {
    return jsStringEscape(str);
  }

  return str as string;
};

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
  userInteractions: UserInteraction[]
) => (userInteraction: UserInteraction): UserInteraction => {
  let interaction = { ...userInteraction }; // Copy interaction to modify

  if (!interaction.viewId || interaction.viewId.indexOf('id/0x') !== -1) {
    interaction.viewId = '';
  }

  if (interaction.className && interaction.className.length > 0) {
    delete (interaction as any).accessibilityClassName; // Not needed if className is known
    delete (interaction as any).viewTag;
  } else {
    delete (interaction as any).className;

    let accessibilityClassName = interaction.accessibilityClassName;
    if (accessibilityClassName && accessibilityClassName.length > 0) {
      delete (interaction as any).viewTag; // Not needed if accessibilityClassName is known
    } else {
      delete (interaction as any).accessibilityClassName;
    }
  }

  if (!interaction.viewTag) {
    delete (interaction as any).viewTag;
  }

  if (interaction.viewId) {
    let packageIdPair = interaction.viewId.split(':id/');

    if (packageIdPair.length === 2) {
      interaction.viewId = packageIdPair[1];
    }

    delete (interaction as any).accessibilityClassName; // Not needed if viewId is known
    delete (interaction as any).viewTag; // Not needed if viewId is known
    delete (interaction as any).contentDescription; // Not needed if viewId is known
  }

  let xpath: string = '';
  if (interaction.locators) {
    let xpathLocator = interaction.locators.find(
      locator => locator.kind === 'xpath'
    );
    if (xpathLocator) {
      xpath = xpathLocator.value;
    }
  }

  let textBeforeFocusLoss = interaction.label;
  let textFieldGainedFocus = interaction.isEditText && interaction.kind === 10;
  if (textFieldGainedFocus) {
    let currentIndex = userInteractions.findIndex(function(element) {
      return element === userInteraction;
    });

    if (currentIndex >= 0) {
      for (let i = currentIndex + 1; i < userInteractions.length; i++) {
        let traversedInteraction = userInteractions[i];

        if (traversedInteraction.kind === 7) {
          textBeforeFocusLoss = traversedInteraction.label;
          break;
        }
      }
    }
  }

  let viewScrolled = false;
  if (
    interaction.scroll &&
    (interaction.isListView ||
      interaction.isScrollView ||
      interaction.isRecyclerView)
  ) {
    viewScrolled = true;
  }

  let scrollableParentXpath: string = '';
  if (interaction.scrollableParentLocators) {
    let xpathLocator = interaction.scrollableParentLocators.find(
      locator => locator.kind === 'xpath'
    );
    if (xpathLocator) {
      scrollableParentXpath = xpathLocator.value;
    }
  }

  if (typeof interaction.kind === 'string') {
    interaction.kind = parseInt(interaction.kind);
  }

  return {
    ...interaction,
    buttonPressed: interaction.kind === 1,
    textFieldLostFocus: interaction.isEditText && interaction.kind === 7,
    buttonLongPressed: interaction.kind === 8,
    buttonDoublePressed: interaction.kind === 9,
    viewScrolled: interaction.kind === 11 && viewScrolled,
    textFieldGainedFocus,
    className: escape(interaction.className),
    accessibilityClassName: escape(interaction.className),
    viewTag: escape(interaction.viewTag),
    label: escape(interaction.label),
    contentDescription: escape(interaction.contentDescription),
    xpath: escape(xpath),
    scrollableParentXpath: escape(scrollableParentXpath),
    textInScrollableParent: escape(interaction.textInScrollableParent),
    textBeforeFocusLoss: escape(textBeforeFocusLoss),
    accessibilityLabel: escape(interaction.accessibilityLabel),
    accessibilityIdentifier: escape(interaction.accessibilityIdentifier),
    accessibilityHint: escape(interaction.accessibilityHint),
    scrollableParentAccessibilityIdentifier: escape(
      interaction.scrollableParentAccessibilityIdentifier
    ),
    locators: (interaction.locators || []).map(
      (l: Locator): Locator => {
        return {
          kind: l.kind,
          value: escape(l.value)
        };
      }
    )
  };
};

export const correctScalingAndroid = (
  options: string,
  metaEvents: MetaEvent[]
) => (input: Input): Input => {
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
      result.y * inverseVideoScaling + (statusBarHeight - statusBarHeight) // This is temporary until we find a conflicting device
    );
  }

  return result;
};

export const correctScalingIOS = (input: Input): Input => {
  let result = {
    ...input
  } as TouchInput;

  if (result.x && result.y) {
    result.x = result.x * 0.5;
    result.y = result.y * 0.5;
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
    return false; // Assume last activity with 0 ts is not splash
  }

  return foregroundActivity.ts >= 0;
};

export const ignoreNonSplashActivity = (
  foregroundActivity: ForegroundActivity,
  index: number,
  activities: ForegroundActivity[]
): boolean => {
  return !ignoreSplashActivity(foregroundActivity, index, activities);
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

export const findSplashScreen = (sessionData: SessionData): string => {
  let isIOS = sessionData.platform === '1';
  if (isIOS) {
    return '';
  }

  let foregroundActivities = (sessionData.events.foregroundActivities || [])
    .filter(ignoreNonSplashActivity)
    .map(sanitizeForegroundActivity(sessionData.packageName));

  if (foregroundActivities.length > 0) {
    let screenFullName = (foregroundActivities[
      foregroundActivities.length - 1
    ] as ForegroundActivity).name;

    let screenFullNameExplode = screenFullName.split('.');

    return '*.' + screenFullNameExplode[screenFullNameExplode.length - 1];
  } else {
    return '';
  }
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
    appName: sessionData.appName,
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

export const extractMetaData = (sessionData: SessionData): SessionMetaData => {
  let isIOS = sessionData.platform === '1';

  return {
    appName: sessionData.appName,
    platform: isIOS ? 'ios' : 'android',
    packageName: sessionData.packageName,
    options: sessionData.options,
    events: {
      meta: JSON.parse(JSON.stringify(sessionData.events.meta || []))
    }
  };
};
