const wd = require('wd');
const xmlEscape = require('xml-escape');

exports.packageName = undefined; // Will be filed before test begins
exports.driver = undefined; // Will be filed before test begins

let promiseChain = null;
let lastAction = null;

exports.begin = function(initialDelay) {
  promiseChain = exports.driver.sleep(initialDelay);
  return promiseChain;
};

exports.findTextInView = function(text, viewClassName, pure) {
  let result = exports.driver
    .elementByXPath('//' + viewClassName + "[@text='" + xmlEscape(text) + "']")
    .then(function(view) {
      if (!view) {
        throw new Error(
          'No ' + viewClassName + " found with text '" + text + "'"
        );
      }

      return view;
    });

  if (!pure) {
    promiseChain = result;
  }

  return result;
};

exports.findViewById = function(viewId, text, viewClassName, pure) {
  let idBundle = exports.packageName + ':id/' + viewId;
  let textMatch = '';

  if (text && text.length > 0 && idBundle !== text) {
    textMatch = '.textStartsWith("' + xmlEscape(text) + '")';
  }

  let result = exports.driver
    .elementsByAndroidUIAutomator(
      'new UiSelector().resourceId("' + idBundle + '")' + textMatch
    )
    .then(function(views) {
      if (views.length == 0 && text && text.length > 0 && text !== idBundle) {
        return exports.findTextInView(text, viewClassName, pure);
      }

      return views;
    });

  if (!pure) {
    promiseChain = result;
  }

  return result;
};

exports.findViewByPath = function(path, pure) {
  let result = exports.driver.elementByXPath(path).then(function(view) {
    if (!view) {
      throw new Error("No view found with path '" + path + "'");
    }

    return view;
  });

  if (!pure) {
    promiseChain = result;
  }

  return result;
};

exports.scrollToTextByPath = function(path, text, pure) {
  let idBundle = exports.packageName + ':id/';

  if (text.indexOf(idBundle) !== -1) {
    return exports.driver;
  }

  let result = exports.driver.elementByXPath(path).then(function(view) {
    if (!view) {
      throw new Error("No view found with path '" + path + "'");
    }

    let textsOnScreen = text.split(' ').reverse();

    let scrollUntilAllTextVisible = v => {
      if (textsOnScreen.length == 0) {
        return v;
      }

      let currentText = textsOnScreen.pop();

      return view
        .elementsByAndroidUIAutomator(
          'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().textContains("' +
            currentText +
            '").instance(0));'
        )
        .then(function(v) {
          return scrollUntilAllTextVisible(v);
        });
    };

    return scrollUntilAllTextVisible(view);
  });

  if (!pure) {
    promiseChain = result;
  }

  return result;
};

exports.tap = function() {
  return (promiseChain = promiseChain.then(function(button) {
    let action = new wd.TouchAction(exports.driver);

    if (Array.isArray(button)) {
      action.tap({ el: button[0] });
    } else {
      action.tap({ el: button });
    }

    return action.perform();
  }));
};

exports.doublePress = function() {
  return (promiseChain = promiseChain.then(function(button) {
    let action = new wd.TouchAction(exports.driver);

    if (Array.isArray(button)) {
      action.press({ el: button[0] });
      action.release({ el: button[0] });
      action.press({ el: button[0] });
      action.release({ el: button[0] });
    } else {
      action.press({ el: button });
      action.release({ el: button });
      action.press({ el: button });
      action.release({ el: button });
    }

    return action.perform();
  }));
};

exports.longPress = function() {
  return (promiseChain = promiseChain.then(function(button) {
    let action = new wd.TouchAction(exports.driver);

    if (Array.isArray(button)) {
      action.longPress({ el: button[0] });
    } else {
      action.longPress({ el: button });
    }

    return action.perform();
  }));
};

exports.touchDown = function(x, y, delay) {
  return (promiseChain = promiseChain.then(function() {
    if (lastAction) {
      return lastAction.perform().then(function() {
        lastAction = new wd.TouchAction(exports.driver);

        x = Math.round(x);
        y = Math.round(y);

        lastAction.press({ x: x, y: y });
        lastAction.wait({ ms: 10 });

        if (delay && delay > 0) {
          lastAction.wait({ ms: delay });
        }

        return lastAction.perform();
      });
    }

    lastAction = new wd.TouchAction(exports.driver);

    x = Math.round(x);
    y = Math.round(y);

    lastAction.press({ x: x, y: y });

    if (delay && delay > 0) {
      lastAction.wait({ ms: delay });
    }

    return lastAction.wait({ ms: 10 });
  }));
};

exports.touchMove = function(x, y, delay) {
  return (promiseChain = promiseChain.then(function() {
    let action = lastAction ? lastAction : new wd.TouchAction(exports.driver);

    x = Math.round(x);
    y = Math.round(y);

    let result = action.moveTo({ x: x, y: y });

    if (delay && delay > 0) {
      result = lastAction.wait({ ms: delay });
    }

    return result;
  }));
};

exports.touchUp = function(x, y, delay) {
  return (promiseChain = promiseChain.then(function() {
    let action = lastAction ? lastAction : new wd.TouchAction(exports.driver);

    x = Math.round(x);
    y = Math.round(y);

    action.moveTo({ x: x, y: y });
    action.release({ x: x, y: y });

    if (delay && delay > 0) {
      action.wait({ ms: delay });
    }

    return action
      .perform()
      .then(function(result) {
        lastAction = null;

        return result;
      })
      .catch(function() {
        lastAction = null;
        /* ignore broken touches */
      });
  }));
};

exports.touches = async function(touchesArray) {
  if (touchesArray.length >= 2) {
    let down = touchesArray[0];
    let up = touchesArray[touchesArray.length - 1];

    if (down.length === 3) {
      await exports.touchDown(down[0], down[1], down[2]);
    }

    for (let i = 0; i < touchesArray.length; i++) {
      const t = touchesArray[i];
      if (i !== 0 && i !== touchesArray.length - 1) {
        let move = t;

        if (move.length === 3) {
          await exports.touchMove(move[0], move[1], move[2]);
        }
      }
    }

    if (up.length === 3) {
      await exports.touchUp(up[0], up[1], up[2]);
    }
  }
};

exports.back = function() {
  return (promiseChain = promiseChain.back());
};

exports.insertText = function(text, viewId) {
  return (promiseChain = promiseChain
    .then(function() {
      return exports.driver.hideDeviceKeyboard();
    })
    .then(function() {
      if (viewId) {
        return exports.findViewById(viewId, undefined, undefined, true);
      }

      return {
        clear: function() {}
      };
    })
    .then(function(elements) {
      if (Array.isArray(elements)) {
        return elements[0].clear();
      } else {
        return elements.clear();
      }
    })
    .then(function() {
      return exports.driver.execute('mobile:type', { text });
    })
    .then(function() {
      // Not returning is intentional. this is fire and forget
      exports.driver.execute('mobile:dismissAlert', {}).catch(function() {});
    })
    .then(function() {
      return exports.driver.execute('mobile:performEditorAction', {
        action: 'done'
      });
    })
    .then(function() {
      return exports.driver.pressKeycode(111);
    }));
};

exports.waitActivity = function(activityName, isLastActionBackButton) {
  let attemptCount = 0;

  function attempt(chain) {
    chain = chain.getCurrentActivity();

    return chain.then(function(foundActivity) {
      if (foundActivity === activityName) {
        return chain;
      }

      if (foundActivity !== activityName && attemptCount === 10) {
        throw new Error(
          'Waited 10 seconds for ' +
            activityName +
            ' but found ' +
            foundActivity
        );
      }

      return chain.sleep(1000).then(function() {
        attemptCount++;

        if (attemptCount == 5 && isLastActionBackButton) {
          return chain.back().then(function() {
            return attempt(chain);
          });
        } else {
          return attempt(chain);
        }
      });
    });
  }

  return (promiseChain = attempt(promiseChain));
};
