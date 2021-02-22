import { TestLinesAppenderVisitor } from '../../test-lines/test-lines-visitor';
import { UserInteractionTestLine } from '../../test-lines/user-interaction';

export class UserInteractionVisitor extends TestLinesAppenderVisitor {
  visitUserInteractionTestLine(line: UserInteractionTestLine) {
    let generatedDartLine = '\n';

    if (line.userInteraction.scrollableParentAccessibilityIdentifier) {
      generatedDartLine = this.generateScrollToText(line, generatedDartLine);
    }

    // Button press
    generatedDartLine = this.generateButtonPressForViewsWithIds(
      line,
      generatedDartLine
    );

    // Button long press
    generatedDartLine = this.generateLongPressForViewsWithIds(
      line,
      generatedDartLine
    );

    // Button double press
    generatedDartLine = this.generateDoublePressForViewsWithIds(
      line,
      generatedDartLine
    );

    // Test field focus gain
    generatedDartLine = this.generateTextFieldKeyboardType(
      line,
      generatedDartLine
    );

    // console.log(JSON.stringify(line));
    // console.log(generatedDartLine);

    generatedDartLine += `      await Future<void>.delayed(Duration(seconds: 1));
`;

    this.append(generatedDartLine);

    super.visitUserInteractionTestLine(line);
  }

  private generateTextFieldKeyboardType(
    line: UserInteractionTestLine,
    generatedDartLine: string
  ): string {
    if (
      line.userInteraction.textFieldGainedFocus &&
      line.userInteraction.accessibilityIdentifier
    ) {
      generatedDartLine += `
      // TF : ${line.userInteraction.timeString}
      await interactions.insertText('${line.userInteraction.textBeforeFocusLoss}', '${line.userInteraction.accessibilityIdentifier}');
`;
    }
    return generatedDartLine;
  }

  private generateDoublePressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedDartLine: string
  ): string {
    if (
      line.userInteraction.buttonDoublePressed &&
      line.userInteraction.accessibilityIdentifier
    ) {
      generatedDartLine += `      // TF : ${line.userInteraction.timeString}
      `;
      generatedDartLine += `      await interactions.doublePress('${
        line.userInteraction.accessibilityIdentifier
      }', scrollableKey: '${line.userInteraction
        .scrollableParentAccessibilityIdentifier ?? ''}');
      print("\\nTF : Double pressed key/${
        line.userInteraction.accessibilityIdentifier
      }, time: ${line.userInteraction.timeString}\\n");
`;
    }
    return generatedDartLine;
  }

  private generateLongPressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedDartLine: string
  ): string {
    if (
      line.userInteraction.buttonLongPressed &&
      line.userInteraction.accessibilityIdentifier
    ) {
      generatedDartLine += `      // TF : ${line.userInteraction.timeString}
      `;
      generatedDartLine += `      await interactions.longPress('${
        line.userInteraction.accessibilityIdentifier
      }', scrollableKey: '${line.userInteraction
        .scrollableParentAccessibilityIdentifier ?? ''}');
      print("\\nTF : Long pressed key/${
        line.userInteraction.accessibilityIdentifier
      }, time: ${line.userInteraction.timeString}\\n");
`;
    }
    return generatedDartLine;
  }

  private generateButtonPressForViewsWithIds(
    line: UserInteractionTestLine,
    generatedDartLine: string
  ): string {
    if (
      line.userInteraction.buttonPressed &&
      line.userInteraction.accessibilityIdentifier
    ) {
      generatedDartLine += `      // TF : ${line.userInteraction.timeString}
      `;
      generatedDartLine += `      await interactions.tap('${
        line.userInteraction.accessibilityIdentifier
      }', scrollableKey: '${line.userInteraction
        .scrollableParentAccessibilityIdentifier ?? ''}');
      print("\\nTF : Clicked key/${
        line.userInteraction.accessibilityIdentifier
      }, time: ${line.userInteraction.timeString}\\n");
`;
    }
    return generatedDartLine;
  }

  private generateScrollToText(
    line: UserInteractionTestLine,
    generatedDartLine: string
  ): string {
    if (
      line.userInteraction.label &&
      line.userInteraction.scrollableParentAccessibilityIdentifier &&
      line.userInteraction.scrollableParentAccessibilityIdentifier.length > 0
    ) {
      generatedDartLine += `
      // TF : ${line.userInteraction.timeString}
      await interactions.scrollToText('${
        line.userInteraction.scrollableParentAccessibilityIdentifier
      }', '${line.userInteraction.textInScrollableParent ?? ''}');
      await interactions.scrollToText('${
        line.userInteraction.scrollableParentAccessibilityIdentifier
      }', '${line.userInteraction.label}');
      print("\\nTF : Scrolled to ${line.userInteraction.label}, time: ${
        line.userInteraction.timeString
      }\\n");
`;
    }

    return generatedDartLine;
  }
}
