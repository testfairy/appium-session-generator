import { TestLinesAppenderVisitor } from '../../test-lines/test-lines-visitor';
import { InputTestLine } from '../../test-lines/input';
import { KeyInput, TouchInput } from '../../session-types';

export class InputVisitor extends TestLinesAppenderVisitor {
  visitInputTestLine(line: InputTestLine) {
    let generatedJsLine = '';

    if ((line.input as TouchInput).touchDown) {
      let input = line.input as TouchInput;

      generatedJsLine += `
    // TF : ${input.timeString}
    await interactions.touchDown(${input.x}, ${input.y}, ${line.sleep});
`;
    }

    if ((line.input as TouchInput).touchMove) {
      let input = line.input as TouchInput;

      generatedJsLine += `
    // TF : ${input.timeString}
    await interactions.touchMove(${input.x}, ${input.y}, ${line.sleep});
`;
    }

    if ((line.input as TouchInput).touchUp) {
      let input = line.input as TouchInput;

      generatedJsLine += `
    // TF : ${input.timeString}
    await interactions.touchUp(${input.x}, ${input.y}, ${line.sleep});
`;
    }

    if ((line.input as KeyInput).backButton) {
      let input = line.input as TouchInput;

      generatedJsLine += `
    // TF : ${input.timeString}
    console.log("\\nTF : Pressed back, time: ${input.timeString}\\n".magenta.underline);
    await interactions.back().sleep(${line.sleep});
`;
    }

    // console.log(generatedJsLine);

    this.append(generatedJsLine);

    super.visitInputTestLine(line);
  }
}
