import { TestLinesAppenderVisitor } from '../../test-lines/test-lines-visitor';
import { UserInteractionTestLine } from '../../test-lines/user-interaction';

export class UserInteractionVisitor extends TestLinesAppenderVisitor {
  visitUserInteractionTestLine(line: UserInteractionTestLine) {
    let generatedJsLine = '';

    if (
      line.userInteraction.scrollableParentXpath &&
      line.userInteraction.scrollableParentLocators.length > 0
    ) {
      generatedJsLine = this.generateScrollToText(line, generatedJsLine);
    }

    if (line.userInteraction.viewId) {
      // Common view assertion for all gestures below
      generatedJsLine = this.generateViewExistsAssertion(line, generatedJsLine);

      // Button press
      generatedJsLine = this.generateButtonPressForViewsWithIds(
        line,
        generatedJsLine
      );

      // Button long press
      generatedJsLine = this.generateLongPressForViewsWithIds(
        line,
        generatedJsLine
      );

      // Button double press
      generatedJsLine = this.generateDoublePressForViewsWithIds(
        line,
        generatedJsLine
      );

      // Test field focus gain
      generatedJsLine = this.generateTextFieldKeyboardType(
        line,
        generatedJsLine
      );
    } else {
      // Common view assertion for all gestures below
      generatedJsLine = this.generateViewExistsByXpathAssertion(
        line,
        generatedJsLine
      );

      // Button press
      generatedJsLine = this.generateButtonPressForViewsWithoutIds(
        line,
        generatedJsLine
      );

      // Button long press
      generatedJsLine = this.generateLongPressForViewsWithoutIds(
        line,
        generatedJsLine
      );

      // Button double press
      generatedJsLine = this.generateDoublePressForViewsWithoutIds(
        line,
        generatedJsLine
      );

      // Test field focus gain
      generatedJsLine = this.generateTextFieldKeyboardTypeOnLastFocus(
        line,
        generatedJsLine
      );
    }

    // console.log(generatedJsLine);

    this.append(generatedJsLine);

    super.visitUserInteractionTestLine(line);
  }

  private generateTextFieldKeyboardTypeOnLastFocus(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    if (line.userInteraction.textFieldGainedFocus) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    await interactions.insertText('${line.userInteraction.textBeforeFocusLoss}'); // EDITME : Edit the string on the left or remove line if not relevant
`;
    }
    return generatedJsLine;
  }

  private generateViewExistsByXpathAssertion(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    await interactions.findViewByPath("${line.userInteraction.xpath}");
`;
    return generatedJsLine;
  }

  private generateDoublePressForViewsWithoutIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    if (line.userInteraction.buttonDoublePressed) {
      generatedJsLine += `    await interactions.doublePress();
    console.log("\\nTF : Double pressed ${line.userInteraction.label}, time: ${line.userInteraction.timeString}\\n".magenta.underline);
`;
    }
    return generatedJsLine;
  }

  private generateLongPressForViewsWithoutIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    if (line.userInteraction.buttonLongPressed) {
      generatedJsLine += `    await interactions.longPress();
    console.log("\\nTF : Long pressed ${line.userInteraction.label}, time: ${line.userInteraction.timeString}\\n".magenta.underline);
`;
    }
    return generatedJsLine;
  }

  private generateButtonPressForViewsWithoutIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    if (line.userInteraction.buttonPressed) {
      generatedJsLine += `    await interactions.tap();
    console.log("\\nTF : Clicked ${line.userInteraction.label}, time: ${line.userInteraction.timeString}\\n".magenta.underline);
`;
    }
    return generatedJsLine;
  }

  private generateTextFieldKeyboardType(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    if (line.userInteraction.textFieldGainedFocus) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    await interactions.insertText('${line.userInteraction.textBeforeFocusLoss}', '${line.userInteraction.viewId}'); // EDITME : Edit the string on the left or remove line if not relevant
`;
    }
    return generatedJsLine;
  }

  private generateViewExistsAssertion(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    await interactions.findViewById('${line.userInteraction.viewId}', '${line.userInteraction.label}', '${line.userInteraction.className}');
    // await interactions.findViewByPath("${line.userInteraction.xpath}");
`;
    return generatedJsLine;
  }

  private generateDoublePressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    if (line.userInteraction.buttonDoublePressed) {
      generatedJsLine += `    await interactions.doublePress();
    console.log("\\nTF : Double pressed id/${line.userInteraction.viewId}, time: ${line.userInteraction.timeString}\\n".magenta.underline);
`;
    }
    return generatedJsLine;
  }

  private generateLongPressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    if (line.userInteraction.buttonLongPressed) {
      generatedJsLine += `    await interactions.longPress();
    console.log("\\nTF : Long pressed id/${line.userInteraction.viewId}, time: ${line.userInteraction.timeString}\\n".magenta.underline);
`;
    }
    return generatedJsLine;
  }

  private generateButtonPressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    if (line.userInteraction.buttonPressed) {
      generatedJsLine += `    await interactions.tap();
    console.log("\\nTF : Clicked id/${line.userInteraction.viewId}, time: ${line.userInteraction.timeString}\\n".magenta.underline);
`;
    }
    return generatedJsLine;
  }

  private generateScrollToText(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ): string {
    // TODO FIXME: bad mojo bug here!
    if (`${line.userInteraction.textInScrollableParent}`.indexOf("\n") >= 0) return generatedJsLine;
    generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    await interactions.scrollToTextByPath('${line.userInteraction.scrollableParentXpath}', '${line.userInteraction.textInScrollableParent}');
    await interactions.scrollToTextByPath('${line.userInteraction.scrollableParentXpath}', '${line.userInteraction.label}');
    console.log("\\nTF : Scrolled to ${line.userInteraction.label}, time: ${line.userInteraction.timeString}\\n".magenta.underline);
`;

    return generatedJsLine;
  }
}
