export type Event = {
  ts: number;

  // Embelishments for code generation
  timeString: string;
};

export type MetaEvent = {
  ts: number;
  type: number;
};

export type KeyInput = {
  ts: number;
  t: number;
  act: number;
  kc: number;

  // Embelishments for code generation
  backButton: boolean;
  timeString: string;
};

export type TouchInput = {
  x: number;
  y: number;
  act: number;
  t: number;
  ts: number;

  // Embelishments for code generation
  touchUp: boolean;
  touchMove: boolean;
  touchDown: boolean;
  timeString: string;
};

export type Input = KeyInput | TouchInput;

export type Checkpoint = {
  name: string;
  ts: number;

  // Embelishments for code generation
  timeString: string;
};

export type LocatorKind = 'xpath';

export type Locator = {
  kind: LocatorKind;
  value: string;
};

export type Fling = {
  velocityX: number;
  velocityY: number;
};

export type ScrollDistance = {
  distanceX: number;
  distanceY: number;
};

export type Scroll = {
  scrolls: ScrollDistance[];
  fling: Fling;
  screenDensity: number;
};

export type UserInteraction = {
  kind: number;
  label: string;
  textInScrollableParent: string;
  contentDescription: string;
  viewId: string;
  className: string;
  accessibilityClassName: string;
  viewTag: string;
  ts: number;
  isEditText: boolean;
  isScrollView: boolean;
  isListView: boolean;
  isRecyclerView: boolean;
  locators: Locator[];
  scrollableParentLocators: Locator[];
  scroll: Scroll;
  accessibilityLabel: string;
  accessibilityIdentifier: string;
  accessibilityHint: string;
  scrollableParentAccessibilityIdentifier: string;

  // Embelishments for code generation
  buttonPressed: boolean;
  textFieldLostFocus: boolean;
  buttonLongPressed: boolean;
  buttonDoublePressed: boolean;
  textFieldGainedFocus: boolean;
  viewScrolled: boolean;
  xpath: string;
  scrollableParentXpath: string;
  textBeforeFocusLoss: string;
  timeString: string;
};

export type ForegroundActivity = {
  name: string;
  ts: number;

  // Embelishments for code generation
  isLastActionBackButton: boolean;
  timeString: string;
};
