import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { runGodot } from '../godot/setup';

export function parseArgs(args: string[]): { character?: string; root: string; full: boolean } {
  let character: string | undefined; let full = false;
  let root = process.cwd();
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--character') {
      character = args[++i];
      if (!character || character.startsWith('--')) throw new Error('--character requires a character ID');
    }
    else if (args[i] === '--root') root = args[++i]!;
    else if (args[i] === '--full') full = true;
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  if (full && character) throw new Error('--full cannot combine with --character');
  if (args.includes('--root') && !root) throw new Error('--root requires a project directory');
  if (character && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(character)) throw new Error(`Invalid character ID '${character}'; use lowercase kebab-case`);
  return { character, root, full };
}

export function runAuthoritativeValidate(args: string[] = []): string {
  const parsed = parseArgs(args);
  const root = resolve(parsed.root);
  if (!existsSync(join(root, 'project.godot')) || !existsSync(join(root, 'game/tools/validate_content.gd'))) {
    throw new Error('--root requires a Streets of Rock Godot project containing project.godot and game/tools/validate_content.gd; import its resources in the editor first');
  }
  const command = ['--headless', '--path', root, '--script', 'res://game/tools/validate_content.gd'];
  command.push('--');
  if (parsed.character) command.push('--character', parsed.character);
  const result = runGodot(command);
  if (result.status !== 0) throw new Error(result.output || 'Godot content validation failed');
  return result.output.trim();
}

if (import.meta.main) {
  try { console.log(runAuthoritativeValidate(process.argv.slice(2))); }
  catch (error) { console.error(`Character validation failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
}
