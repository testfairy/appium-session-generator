import { TestLinesAppenderVisitor } from '../test-lines/test-lines-visitor';
import { UserInteractionTestLine } from '../test-lines/user-interaction';

export class UserInteractionVisitor extends TestLinesAppenderVisitor {
  visitUserInteractionTestLine(line: UserInteractionTestLine) {
    let generatedJsLine = '';

    if (line.userInteraction.viewId) {
      // Swipe gesture
      generatedJsLine = this.generateSwipeForViewsWithIds(
        line,
        generatedJsLine
      );

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

      // Common view assertion for all gestures above
      generatedJsLine = this.generateViewExistsAssertion(line, generatedJsLine);

      // Test field focus gain
      generatedJsLine = this.generateTextFieldKeyboardType(
        line,
        generatedJsLine
      );
    } else {
      // Swipe gesture
      generatedJsLine = this.generateSwipeForViewsWithoutIds(
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

      // Common view assertion for all gestures above
      generatedJsLine = this.generateViewExistsByXpathAssertion(
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
  ) {
    if (line.userInteraction.textFieldGainedFocus) {
      generatedJsLine += `
    await interactions.insertText('${line.userInteraction.textBeforeFocusLoss}'); // EDITME : Edit the string on the left or remove line if not relevant
`;
    }
    return generatedJsLine;
  }

  private generateViewExistsByXpathAssertion(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    generatedJsLine += `
    // await interactions.findViewByPath("${line.userInteraction.xpath}");
`;
    return generatedJsLine;
  }

  private generateDoublePressForViewsWithoutIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.buttonDoublePressed) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    console.log("\\nTF : Double pressed ${line.userInteraction.label}, time: ${line.userInteraction.timeString}\\n".magenta.underline);`;
    }
    return generatedJsLine;
  }

  private generateLongPressForViewsWithoutIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.buttonLongPressed) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    console.log("\\nTF : Long pressed ${line.userInteraction.label}, time: ${line.userInteraction.timeString}\\n".magenta.underline);`;
    }
    return generatedJsLine;
  }

  private generateButtonPressForViewsWithoutIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.buttonPressed) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    console.log("\\nTF : Clicked ${line.userInteraction.label}, time: ${line.userInteraction.timeString}\\n".magenta.underline);`;
    }
    return generatedJsLine;
  }

  private generateSwipeForViewsWithoutIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.swipe) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    console.log("\\nTF : Swiped ${line.userInteraction.label}, time: ${line.userInteraction.timeString}\\n".magenta.underline);`;
    }
    return generatedJsLine;
  }

  private generateTextFieldKeyboardType(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.textFieldGainedFocus) {
      generatedJsLine += `
    await interactions.insertText('${line.userInteraction.textBeforeFocusLoss}', '${line.userInteraction.viewId}'); // EDITME : Edit the string on the left or remove line if not relevant
`;
    }
    return generatedJsLine;
  }

  private generateViewExistsAssertion(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    generatedJsLine += `
    await interactions.findViewById('${line.userInteraction.viewId}', '${line.userInteraction.label}', '${line.userInteraction.className}');
    // await interactions.findViewByPath("${line.userInteraction.xpath}");
`;
    return generatedJsLine;
  }

  private generateDoublePressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.buttonDoublePressed) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    console.log("\\nTF : Double pressed id/${line.userInteraction.viewId}, time: ${line.userInteraction.timeString}\\n".magenta.underline);`;
    }
    return generatedJsLine;
  }

  private generateLongPressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.buttonLongPressed) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    console.log("\\nTF : Long pressed id/${line.userInteraction.viewId}, time: ${line.userInteraction.timeString}\\n".magenta.underline);`;
    }
    return generatedJsLine;
  }

  private generateButtonPressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.buttonPressed) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    console.log("\\nTF : Clicked id/${line.userInteraction.viewId}, time: ${line.userInteraction.timeString}\\n".magenta.underline);`;
    }
    return generatedJsLine;
  }

  private generateSwipeForViewsWithIds(
    line: UserInteractionTestLine,
    generatedJsLine: string
  ) {
    if (line.userInteraction.swipe) {
      generatedJsLine += `
    // TF : ${line.userInteraction.timeString}
    console.log("\\nTF : Swiped id/${line.userInteraction.viewId}, time: ${line.userInteraction.timeString}\\n".magenta.underline);`;
    }
    return generatedJsLine;
  }
}
