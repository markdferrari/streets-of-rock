import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runScaffold } from '../../scripts/characters/scaffold';
import cow from '../../content/characters/cow.json';
import crow from '../../content/characters/crow.json';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'sor-scaffold-contract-'));
  await mkdir(join(root, 'content/characters'), { recursive: true });
  await mkdir(join(root, 'specs/010-active/checklists'), { recursive: true });
  await writeFile(join(root, 'specs/010-active/spec.md'), 'active'); await writeFile(join(root, 'specs/010-active/tasks.md'), 'tasks');
  await writeFile(join(root, 'content/characters/cow.json'), JSON.stringify(cow)); await writeFile(join(root, 'content/characters/crow.json'), JSON.stringify(crow));
  const brief = join(root, 'brief.md'); await writeFile(brief, 'A mobile fighter with a supported fast combo.');
  return { root, brief };
}
describe('character scaffold output scope', () => {
  it('defaults to the active feature drafts and retains the requested brief', async () => {
    const { root, brief } = await fixture();
    const result = await runScaffold(['--id', 'new-fighter', '--brief', brief], root);
    expect(result.definition).toContain('specs/010-active/drafts/new-fighter');
    expect(await readFile(result.report, 'utf8')).toContain('supported fast combo');
  });
  it('supports an explicit output directory and refuses collisions before writing', async () => {
    const { root, brief } = await fixture(); const output = join(root, 'draft-review');
    const result = await runScaffold(['--id', 'custom-fighter', '--brief', brief, '--output-dir', output], root);
    expect(result.definition).toBe(join(output, 'custom-fighter.draft.json'));
    await expect(runScaffold(['--id', 'conflict', '--brief', brief, '--output-dir', output], root)).rejects.toThrow(/output.*already exists/i);
    expect((await readdir(output)).sort()).toEqual(['creation-report.md', 'custom-fighter.draft.json']);
  });
});
