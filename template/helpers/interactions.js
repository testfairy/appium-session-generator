var wd = require('wd');

exports.packageName = undefined; // Will be filed before test begins
exports.driver = undefined; // Will be filed before test begins

let promiseChain = null;

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

exports.click = function() {
  return (promiseChain = promiseChain.then(function(button) {
    var action = new wd.TouchAction(exports.driver);

    if (Array.isArray(button)) {
      action.tap({ el: button[0] });
    } else {
      action.tap({ el: button });
    }

    return action.perform();
  }));
};

exports.touchDown = function(x, y) {
  return (promiseChain = promiseChain.then(function() {
    var action = new wd.TouchAction(exports.driver);

    action.press({ x: x, y: y });

    return action.perform();
  }));
};

exports.touchMove = function(x, y) {
  return (promiseChain = promiseChain.then(function() {
    var action = new wd.TouchAction(exports.driver);

    action.moveTo({ x: x, y: y });

    return action.perform();
  }));
};

exports.touchUp = function(x, y) {
  return (promiseChain = promiseChain.then(function() {
    var action = new wd.TouchAction(exports.driver);

    action.moveTo({ x: x, y: y });
    action.release({ x: x, y: y });

    return action.perform();
  }));
};

exports.back = function() {
  return (promiseChain = promiseChain.back());
};

exports.insertText = function(viewId, text) {
  return (promiseChain = promiseChain
    .then(function() {
      return exports.driver.hideDeviceKeyboard();
    })
    .then(function() {
      return exports.findViewById(viewId, undefined, undefined, true);
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
