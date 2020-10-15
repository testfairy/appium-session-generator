import { TestLinesAppenderVisitor } from '../../test-lines/test-lines-visitor';
import { CheckpointTestLine } from '../../test-lines/checkpoint';

export class CheckpointVisitor extends TestLinesAppenderVisitor {
  visitCheckpointTestLine(line: CheckpointTestLine) {
    let generatedJsLine = `
    // TF : ${line.checkpoint.timeString}
    console.log("\\nTF : ${line.checkpoint.name}, time: ${line.checkpoint.timeString}\\n".magenta.underline);
`;

    // console.log(generatedJsLine);

    this.append(generatedJsLine);

    super.visitCheckpointTestLine(line);
  }
}
