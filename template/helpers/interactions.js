var wd = require('wd');

exports.packageName = undefined; // Will be filed before test begins
exports.driver = undefined; // Will be filed before test begins

exports.begin = function(initialDelay) {
  return exports.driver.sleep(initialDelay);
};

exports.findTextInView = function(promiseChain, text, viewClassName) {
  return promiseChain
    .elementByXPath('//' + viewClassName + "[@text='" + text + "']")
    .then(function(view) {
      if (!view) {
        throw new Error(
          'No ' + viewClassName + " found with text '" + text + "'"
        );
      }

      return view;
    });
};

exports.findViewById = function(promiseChain, viewId) {
  return promiseChain
    .elementsByAndroidUIAutomator(
      'new UiSelector().resourceId("' +
        exports.packageName +
        ':id/' +
        viewId +
        '")'
    )
    .then(function(views) {
      if (views.length == 0) {
        throw new Error("No view found with id '" + viewId + "'");
      }

      return views;
    });
};

exports.click = function(promiseChain) {
  return promiseChain.then(function(button) {
    var action = new wd.TouchAction(exports.driver);

    if (Array.isArray(button)) {
      action.tap({ el: button[0] });
    } else {
      action.tap({ el: button });
    }

    return action.perform();
  });
};

exports.touchDown = function(promiseChain, x, y) {
  return promiseChain.then(function() {
    var action = new wd.TouchAction(exports.driver);

    action.press({ x: x, y: y });

    return action.perform();
  });
};

exports.touchMove = function(promiseChain, x, y) {
  return promiseChain.then(function() {
    var action = new wd.TouchAction(exports.driver);

    action.moveTo({ x: x, y: y });

    return action.perform();
  });
};

exports.touchUp = function(promiseChain, x, y) {
  return promiseChain.then(function() {
    var action = new wd.TouchAction(exports.driver);

    action.moveTo({ x: x, y: y });
    action.release({ x: x, y: y });

    return action.perform();
  });
};

exports.back = function(promiseChain) {
  return promiseChain.back();
};

exports.waitActivity = function(promiseChain, activityName) {
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
        return attempt(chain);
      });
    });
  }

  return attempt(promiseChain);
};
