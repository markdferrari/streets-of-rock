import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { validateCharacterDefinitions, type CharacterDefinitionV1 } from '../../src/content/characters';
import { validateCharacterResources, characterResourcePaths } from '../../src/presentation/character-assets';
import { requiredCharacterClips } from '../../src/content/animation-clips';

export async function validateFiles(root: string, characterId?: string, verifyResources = true): Promise<string> {
  const directory = join(root, 'src/content/characters');
  const files = (await readdir(directory)).filter(file => file.endsWith('.json')).sort();
  const selected = characterId ? [`${characterId}.json`] : files;
  const definitions: unknown[] = [];
  for (const filename of selected) {
    if (!files.includes(filename)) throw new Error(`${filename.slice(0, -5)}: definition file is missing under ${relative(root, directory)}`);
    try { definitions.push(JSON.parse(await readFile(join(directory, filename), 'utf8')) as unknown); }
    catch (error) { throw new Error(`${filename.slice(0, -5)}: invalid JSON (${String(error)})`); }
  }
  try { validateCharacterDefinitions(definitions); }
  catch (error) {
    const firstId = (definitions[0] as { id?: unknown } | undefined)?.id;
    throw new Error(`${typeof firstId === 'string' ? firstId : selected[0]!.slice(0, -5)}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (verifyResources) {
    validateCharacterResources(definitions as readonly CharacterDefinitionV1[]);
    for (const definition of definitions as readonly CharacterDefinitionV1[]) {
      const paths = characterResourcePaths[definition.presentation.modelKey as keyof typeof characterResourcePaths];
      if (!paths) throw new Error(`${definition.id}.presentation.modelKey: unknown static resource key`);
      for (const [field, path] of Object.entries(paths)) {
        try { await readFile(join(root, path)); }
        catch { throw new Error(`${definition.id}.${field}: required file is missing: ${path}`); }
      }
      const modelPath = paths.model;
      const binary = await readFile(join(root, modelPath));
      if (binary.toString('ascii', 0, 4) !== 'glTF') throw new Error(`${definition.id}.modelKey: not a binary glTF file (${modelPath})`);
      const jsonLength = binary.readUInt32LE(12);
      const gltf = JSON.parse(binary.toString('utf8', 20, 20 + jsonLength)) as { animations?: { name?: string }[] };
      const names = new Set((gltf.animations ?? []).map(animation => animation.name));
      const expected = requiredCharacterClips(definition.presentation.animationSetKey as keyof typeof characterResourcePaths);
      const missing = expected.find(name => !names.has(name));
      if (missing) throw new Error(`${definition.id}.animationSetKey: ${modelPath} lacks semantic clip '${missing}'`);
    }
    if ((definitions as readonly CharacterDefinitionV1[]).some(def => def.player.special.kind === 'straightProjectile')) {
      const prop = join(root, 'assets/props/headrest/headrest.glb');
      try { await readFile(prop); } catch { throw new Error(`plates.special.projectileKey: required file is missing: ${relative(root, prop)}`); }
    }
  }
  return `${definitions.length} character definition${definitions.length === 1 ? '' : 's'} valid${verifyResources ? ' with bundled resources' : ''}`;
}

function parseArgs(args: string[]): { character?: string; root: string } {
  let character: string | undefined;
  let root = process.cwd();
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--character') character = args[++i];
    else if (args[i] === '--root') root = args[++i]!;
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  if (character && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(character)) throw new Error(`Invalid character ID '${character}'; use lowercase kebab-case`);
  return { character, root };
}

export async function runValidate(args: string[] = [], root = process.cwd(), verifyResources = false): Promise<string> {
  const parsed = parseArgs(args);
  return validateFiles(root === process.cwd() ? parsed.root : root, parsed.character, verifyResources);
}

if (import.meta.main) {
  try { console.log(await runValidate(process.argv.slice(2), process.cwd(), true)); }
  catch (error) { console.error(`Character validation failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
}
