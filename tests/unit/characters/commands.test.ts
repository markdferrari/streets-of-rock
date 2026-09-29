import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, readdir, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { runValidate } from '../../../scripts/characters/validate';
import { runScaffold } from '../../../scripts/characters/scaffold';
import { validateFiles } from '../../../scripts/characters/validate';
import { characterResourcePaths } from '../../../src/presentation/character-assets';
import cow from '../../../src/content/characters/cow.json';
import crow from '../../../src/content/characters/crow.json';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'sor-characters-'));
  const dir = join(root, 'src/content/characters'); await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'cow.json'), JSON.stringify(cow));
  await writeFile(join(dir, 'crow.json'), JSON.stringify(crow));
  return { root, dir };
}
async function hashDirectory(dir: string) {
  const files = await readdir(dir);
  const chunks = await Promise.all(files.map(async name => Buffer.concat([Buffer.from(name), await readFile(join(dir, name))])));
  return createHash('sha256').update(Buffer.concat(chunks)).digest('hex');
}
async function hashFiles(dir: string, names: string[]) {
  const chunks = await Promise.all(names.map(async name => Buffer.concat([Buffer.from(name), await readFile(join(dir, name))])));
  return createHash('sha256').update(Buffer.concat(chunks)).digest('hex');
}

describe('character authoring commands', () => {
  it('validates without modifying files and reports definition-specific failures', async () => {
    const { root, dir } = await fixture();
    const before = await hashDirectory(dir);
    expect(await runValidate([], root)).toMatch(/2 character definitions valid/);
    expect(await hashDirectory(dir)).toBe(before);
    const broken = { ...cow, schemaVersion: 9 };
    await writeFile(join(dir, 'cow.json'), JSON.stringify(broken));
    await expect(runValidate(['--character', 'cow'], root)).rejects.toThrow(/cow.*schemaVersion/i);
    expect(await readdir(dir)).toEqual(['cow.json', 'crow.json']);
  });

  it('refuses duplicate IDs and existing outputs, and reports unsupported behavior in draft only', async () => {
    const { root } = await fixture();
    const brief = join(root, 'brief.md');
    await writeFile(brief, 'A fast fighter who teleports and throws a headrest.');
    await expect(runScaffold(['--id', 'cow', '--brief', brief], root)).rejects.toThrow(/already exists/i);
    const result = await runScaffold(['--id', 'new-fighter', '--brief', brief], root);
    expect(await readFile(result.report, 'utf8')).toMatch(/unsupported.*teleport/i);
    const draft = JSON.parse(await readFile(result.definition, 'utf8')) as { id: string; player: { special: unknown } };
    expect(draft.id).toBe('new-fighter');
    expect(draft.player.special).toBeNull();
    await expect(runScaffold(['--id', 'new-fighter', '--brief', brief], root)).rejects.toThrow(/output already exists/i);
  });

  it('rejects invalid IDs and incomplete briefs without writing output', async () => {
    const { root } = await fixture();
    const brief = join(root, 'empty.md'); await writeFile(brief, '  ');
    await expect(runScaffold(['--id', '../escape', '--brief', brief], root)).rejects.toThrow(/kebab-case/i);
    await expect(runScaffold(['--id', 'draft', '--brief', brief], root)).rejects.toThrow(/brief.*empty/i);
    expect(await readdir(join(root, 'src/content/characters'))).toEqual(['cow.json', 'crow.json']);
  });

  it('reports a character-specific missing semantic clip without modifying unrelated definitions', async () => {
    const { root, dir } = await fixture();
    const unrelatedBefore = await hashFiles(dir, ['cow.json', 'crow.json']);
    await writeFile(join(dir, 'lion.json'), JSON.stringify((await import('../../../src/content/characters/lion.json')).default));
    const paths = characterResourcePaths.lion;
    const model = join(root, paths.model);
    await mkdir(join(model, '..'), { recursive: true });
    await copyFile(paths.model, model);
    const portrait = join(root, paths.portrait);
    await mkdir(join(portrait, '..'), { recursive: true });
    await copyFile(paths.portrait, portrait);
    const binary = await readFile(model);
    const length = binary.readUInt32LE(12);
    const gltf = JSON.parse(binary.toString('utf8', 20, 20 + length)) as { animations?: { name: string }[] };
    gltf.animations = gltf.animations?.filter(animation => animation.name !== 'lion1.windup');
    const json = Buffer.from(JSON.stringify(gltf));
    const padded = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
    const damaged = Buffer.alloc(20 + padded.length);
    damaged.write('glTF'); damaged.writeUInt32LE(2, 4); damaged.writeUInt32LE(damaged.length, 8);
    damaged.writeUInt32LE(padded.length, 12); damaged.write('JSON', 16); padded.copy(damaged, 20);
    await writeFile(model, damaged);
    await expect(validateFiles(root, 'lion', true)).rejects.toThrow(/lion.*lacks semantic clip 'lion1\.windup'/);
    expect(await readdir(dir)).toEqual(['cow.json', 'crow.json', 'lion.json']);
    expect(await readFile(join(dir, 'cow.json'), 'utf8')).toBe(JSON.stringify(cow));
    expect(await hashFiles(dir, ['cow.json', 'crow.json'])).toBe(unrelatedBefore);
  });
});
