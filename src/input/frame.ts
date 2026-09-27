import type { InputFrame } from '../game/types';
import type { PointerOutput } from './pointers';
export function toInputFrame(output: PointerOutput): InputFrame {
  return { move: { x: output.move.x, depth: output.move.y }, requests: output.requests, canceledPointerIds: output.canceledPointerIds };
}
