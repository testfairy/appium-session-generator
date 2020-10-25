import { TestLinesAppenderVisitor } from '../../test-lines/test-lines-visitor';
import { CheckpointTestLine } from '../../test-lines/checkpoint';

export class CheckpointVisitor extends TestLinesAppenderVisitor {
  visitCheckpointTestLine(line: CheckpointTestLine) {
    let generatedDartLine = `
      // TF : ${line.checkpoint.timeString}
      print("\\nTF : ${line.checkpoint.name}, time: ${line.checkpoint.timeString}\\n");
`;

    // console.log(generatedJsLine);

    this.append(generatedDartLine);

    super.visitCheckpointTestLine(line);
  }
}
