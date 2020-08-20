const wd = require('wd');

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
    .elementByXPath('//' + viewClassName + "[@text='" + text + "']")
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

exports.findViewById = function(viewId, fallbackText, viewClassName, pure) {
  let result = exports.driver
    .elementsByAndroidUIAutomator(
      'new UiSelector().resourceId("' +
        exports.packageName +
        ':id/' +
        viewId +
        '")'
    )
    .then(function(views) {
      if (views.length == 0) {
        return exports.findTextInView(fallbackText, viewClassName, pure);
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

exports.click = function() {
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
