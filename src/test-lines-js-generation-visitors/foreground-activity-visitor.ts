import { TestLinesAppenderVisitor } from 'test-lines/test-lines-visitor';
import { ForegroundActivityTestLine } from 'test-lines/foreground-activity';

export class ForegroundActivityVisitor extends TestLinesAppenderVisitor {
  visitForegroundActivityTestLine(line: ForegroundActivityTestLine) {
    let generatedJsLine = `
    // TF : ${line.foregroundActivity.timeString}
    console.log("\\nTF : In ${line.foregroundActivity.name}, time: ${line.foregroundActivity.timeString}\\n".magenta.underline);`;

    if (line.foregroundActivity.isLastActionBackButton) {
      generatedJsLine += `
    await interactions.waitActivity('${line.foregroundActivity.name}', true);
`;
    } else {
      generatedJsLine += `
    await interactions.waitActivity('${line.foregroundActivity.name}', false);
`;
    }

    // console.log(generatedJsLine);

    this.append(generatedJsLine);

    super.visitForegroundActivityTestLine(line);
  }
}
