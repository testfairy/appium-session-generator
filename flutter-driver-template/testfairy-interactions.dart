import 'package:flutter_driver/flutter_driver.dart';

const interactionTimeout = Duration(seconds: 15);

class Interactions {
  FlutterDriver _driver;

  Interactions(this._driver);

  Future<void> begin(int initialDelayInMilliseconds) async {
    await Future<void>.delayed(
        Duration(milliseconds: initialDelayInMilliseconds));
  }

  Future<void> insertText(String text) async {
    await _driver.enterText(text, timeout: interactionTimeout);
  }

  Future<void> tap(String key, {String scrollableKey = ""}) async {
    if (scrollableKey.isNotEmpty) {
      await _driver.scrollUntilVisible(
          find.byValueKey(scrollableKey), find.byValueKey(key),
          timeout: interactionTimeout, dxScroll: 5, dyScroll: 5);
    }

    await _driver.tap(find.byValueKey(key), timeout: interactionTimeout);
  }

  Future<void> longPress(String key, {String scrollableKey = ""}) async {
    if (scrollableKey.isNotEmpty) {
      await _driver.scrollUntilVisible(
          find.byValueKey(scrollableKey), find.byValueKey(key),
          timeout: interactionTimeout, dxScroll: 5, dyScroll: 5);
    }

    // Slow scroll by dx=0, dy=0 is long press, weird but true
    await _driver.scroll(
        find.byValueKey(key), 0, 0, Duration(milliseconds: 500),
        timeout: interactionTimeout);
  }

  Future<void> doublePress(String key, {String scrollableKey = ""}) async {
    if (scrollableKey.isNotEmpty) {
      await _driver.scrollUntilVisible(
          find.byValueKey(scrollableKey), find.byValueKey(key),
          timeout: interactionTimeout, dxScroll: 5, dyScroll: 5);
    }

    // Fast scroll by dx=0, dy=0 twice is double press
    await _driver.scroll(
        find.byValueKey(key), 0, 0, Duration(milliseconds: 100),
        timeout: interactionTimeout);
    await _driver.scroll(
        find.byValueKey(key), 0, 0, Duration(milliseconds: 100),
        timeout: interactionTimeout);
  }

  Future<void> scrollToText(String scrollableKey, String text) async {
    var splitText = text.split(" ");

    for (var i = 0; i < splitText.length; i++) {
      var t = splitText[i];
      await _driver.scrollUntilVisible(
          find.byValueKey(scrollableKey), find.text(t),
          timeout: interactionTimeout, dxScroll: 5, dyScroll: 5);
    }
  }
}
