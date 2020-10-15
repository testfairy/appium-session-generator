import { InputTestLine } from '../../test-lines/input';
import { KeyInput, TouchInput } from '../../session-types';
import { InputVisitor } from './input-visitor';

type TouchDown = {
  x: number;
  y: number;
  sleep: number;
  timeString: string;
};

type TouchMove = {
  x: number;
  y: number;
  sleep: number;
  timeString: string;
};

type TouchUp = {
  x: number;
  y: number;
  sleep: number;
  timeString: string;
};

/**
 * This visitor tries its best to group consecutive touchDown, touchMove, touchUp
 * events into a single call to interactions.touches() so that when a generated
 * script is previewed, they only occupy a single line and much easier to read.
 *
 * If it fails to do that (i.e multi-touch), it falls back to sending the events
 * in a singular manner.
 */
export class InputAggregateVisitor extends InputVisitor {
  lastKnownTimeString: string = '';
  visitedTouchDown: TouchDown | null = null;
  visitedTouchMoves: TouchMove[] = [];

  visitInputTestLine(line: InputTestLine) {
    this.lastKnownTimeString = line.input.timeString;

    if ((line.input as TouchInput).touchDown) {
      let input = line.input as TouchInput;

      if (this.visitedTouchDown !== null) {
        this.flush(null);
      }

      this.visitedTouchDown = {
        x: input.x,
        y: input.y,
        sleep: line.sleep,
        timeString: input.timeString
      };
    }

    if ((line.input as TouchInput).touchMove) {
      let input = line.input as TouchInput;

      if (this.visitedTouchDown !== null) {
        this.visitedTouchMoves.push({
          x: input.x,
          y: input.y,
          sleep: line.sleep,
          timeString: input.timeString
        });
      } else {
        this.flush(null);
        super.visitInputTestLine(line);
      }
    }

    if ((line.input as TouchInput).touchUp) {
      let input = line.input as TouchInput;

      if (this.visitedTouchDown !== null) {
        this.flush({
          x: input.x,
          y: input.y,
          sleep: line.sleep,
          timeString: input.timeString
        });
      } else {
        super.visitInputTestLine(line);
      }
    }

    if ((line.input as KeyInput).backButton) {
      if (this.visitedTouchDown !== null) {
        this.flush(null);
      }

      super.visitInputTestLine(line);
    }
  }

  flush(touchUp: TouchUp | null) {
    let timeString = '';

    if (this.visitedTouchDown !== null) {
      timeString = this.visitedTouchDown.timeString;
    } else if (this.visitedTouchMoves.length > 0) {
      timeString = this.visitedTouchMoves[0].timeString;
    } else if (touchUp != null) {
      timeString = touchUp.timeString;
    } else {
      timeString = this.lastKnownTimeString;
    }

    let generatedJsLine = `
    // TF : ${timeString}
    await interactions.touches([`;

    let touches: string[] = this.visitedTouchMoves.map(t => this.convert(t));

    if (this.visitedTouchDown !== null) {
      touches.unshift(this.convert(this.visitedTouchDown));
    } else {
      touches.unshift(this.convert(null));
    }

    if (touchUp === null) {
      touches.push(this.convert(null));
    } else {
      touches.push(this.convert(touchUp));
    }

    generatedJsLine += touches.join(', ');
    generatedJsLine += ']);\n';

    // console.log(generatedJsLine);

    this.append(generatedJsLine);

    this.visitedTouchDown = null;
    this.visitedTouchMoves = [];
  }

  convert(touch: TouchDown | TouchMove | TouchUp | null): string {
    if (touch !== null) {
      return `[${touch.x}, ${touch.y}, ${touch.sleep}]`;
    } else {
      return '[]';
    }
  }
}
