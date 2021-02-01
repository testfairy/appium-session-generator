import { TestLinesAppenderVisitor } from '../../test-lines/test-lines-visitor';
import { ForegroundActivityTestLine } from '../../test-lines/foreground-activity';

export class ForegroundActivityVisitor extends TestLinesAppenderVisitor {
  visitForegroundActivityTestLine(line: ForegroundActivityTestLine) {
    let generatedJsLine = `
        // TF : ${line.foregroundActivity.timeString}
        console.log("\\nTF : In ${line.foregroundActivity.name}, time: ${line.foregroundActivity.timeString}\\n".magenta.underline);`;

    generatedJsLine += `
        driver.waitUntil(activityIsShown('${this.extractActivityName(
          line.foregroundActivity.name
        )}'), DEFAULT_ACTIVITY_WAIT_UNTIL);
`;

    // console.log(generatedJsLine);

    this.append(generatedJsLine);

    super.visitForegroundActivityTestLine(line);
  }

  extractActivityName(className: string): string {
    let classNameSplit = className.split('.');

    return `.${classNameSplit[classNameSplit.length - 1]}`;
  }
}
