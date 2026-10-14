import { describe, expect, it } from 'vitest';
import { runnerExit, sha256, templateDirectory, validateVersions, verifyChecksum, type ToolLock } from '../../scripts/godot/setup';
const lock = { version: '4.7.2', editorVersion: '4.7.2.stable.official.ed1daf0bf' } as ToolLock;
describe('pinned project-local Godot setup', () => {
 it('rejects editor/template version mismatches', () => {
  expect(() => validateVersions('4.7.1.stable.official.abc', '4.7.2.stable', lock)).toThrow(/editor/i);
  expect(() => validateVersions(lock.editorVersion, '4.7.1.stable', lock)).toThrow(/template/i);
  expect(() => validateVersions(lock.editorVersion, '4.7.2.stable', lock)).not.toThrow();
 });
 it('rejects corrupt bytes before extraction', () => {
  expect(() => verifyChecksum(new Uint8Array([1]), sha256(new Uint8Array([2])))).toThrow(/checksum/i);
  expect(() => verifyChecksum(new Uint8Array([1]), sha256(new Uint8Array([1])))).not.toThrow();
 });
 it('installs inside the project instead of a global template location', () => {
  expect(templateDirectory('/tmp/project','4.7.2')).toBe('/tmp/project/.tools/godot/4.7.2');
  expect(() => templateDirectory('/tmp/project','../escape')).toThrow();
 });
 it('propagates process, parser, load and assertion failures', () => {
  for (const [status, output] of [[1, ''], [null, ''], [0, 'SCRIPT ERROR: Parse Error'], [0, 'ERROR: Failed loading resource'], [0, 'Failing Tests: 1'], [0, 'Failing Tests         1']] as const) expect(runnerExit(status, output)).toBe(1);
  expect(runnerExit(0,'All tests passed')).toBe(0);
 });
});
