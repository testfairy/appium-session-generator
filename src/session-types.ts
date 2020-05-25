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

export type UserInteraction = {
  kind: number;
  label: string;
  viewId: string;
  className: string;
  accessibilityClassName: string;
  viewTag: string;
  ts: number;

  // Embelishments for code generation
  swipe: boolean;
  buttonPressed: boolean;
  tableCellPressed: boolean; // TODO : Android SDK doesn't send this yet
  checkpointReached: boolean; // TODO : Android SDK doesn't send this yet
  dialogAppeared: boolean; // TODO : Android SDK doesn't send this yet
  dialogDismissed: boolean; // TODO : Android SDK doesn't send this yet
  textFieldLostFocus: boolean; // TODO : Android SDK doesn't send this yet
  buttonLongPressed: boolean;
  buttonDoublePressed: boolean;
  timeString: string;
};

export type ForegroundActivity = {
  name: string;
  ts: number;

  // Embelishments for code generation
  timeString: string;
};
