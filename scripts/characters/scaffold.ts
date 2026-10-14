import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

function parseArgs(args: string[]): { id: string; brief: string; root: string; outputDir?: string } {
  let id = ''; let brief = ''; let root = process.cwd(); let outputDir: string | undefined;
  for (let i=0;i<args.length;i++) {
    if (args[i] === '--id') id = args[++i] ?? '';
    else if (args[i] === '--brief') brief = args[++i] ?? '';
    else if (args[i] === '--root') root = args[++i] ?? process.cwd();
    else if (args[i] === '--output-dir') outputDir = args[++i] ?? '';
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error(`Invalid ID '${id}'; use lowercase kebab-case`);
  if (!brief) throw new Error('A brief file is required: --brief <path>');
  if (outputDir !== undefined && !outputDir.trim()) throw new Error('--output-dir requires a directory');
  return { id, brief, root, outputDir };
}

function activeFeatureDirectory(root: string): string {
  if (!existsSync(join(root, 'specs'))) return join(root, 'specs/007-lion-plates-characters');
  const features = readdirSync(join(root, 'specs'), { withFileTypes: true }).filter(entry => entry.isDirectory() && /^\d+-/.test(entry.name) && existsSync(join(root, 'specs', entry.name, 'tasks.md')) && existsSync(join(root, 'specs', entry.name, 'spec.md'))).map(entry => entry.name).sort((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10));
  return features.length ? join(root, 'specs', features[0]!) : join(root, 'specs/007-lion-plates-characters');
}

export async function runScaffold(args: string[] = [], root = process.cwd()): Promise<{ definition: string; report: string }> {
  const parsed = parseArgs(args);
  const projectRoot = root === process.cwd() ? parsed.root : root;
  const brief = (await readFile(parsed.brief, 'utf8')).trim();
  if (!brief) throw new Error('Brief is empty; include appearance, fighting style, and expected actions');
  const roster = join(projectRoot, 'content/characters');
  const files = (await readdir(roster)).filter(file => file.endsWith('.json'));
  for (const file of files) {
    if (file === `${parsed.id}.json`) throw new Error(`Character ID '${parsed.id}' already exists`);
    try {
      const definition = JSON.parse(await readFile(join(roster, file), 'utf8')) as { id?: string };
      if (definition.id === parsed.id) throw new Error(`Character ID '${parsed.id}' already exists in ${file}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) throw error;
      throw new Error(`Cannot safely check ${file}: invalid JSON`);
    }
  }
  const output = parsed.outputDir ? (isAbsolute(parsed.outputDir) ? resolve(parsed.outputDir) : resolve(projectRoot, parsed.outputDir)) : join(activeFeatureDirectory(projectRoot), 'drafts', parsed.id);
  const definitionPath = join(output, `${parsed.id}.draft.json`);
  const reportPath = join(output, 'creation-report.md');
  if (existsSync(output) || existsSync(definitionPath) || existsSync(reportPath)) throw new Error(`Draft output already exists in directory: ${output}`);
  const unsupported = brief.match(/\b(teleport(?:s|ation)?|time travel|mind control|summon(?:s|ing)?)\b/i)?.[0];
  const draft = {
    schemaVersion: 1, id: parsed.id, displayName: 'TODO', description: brief, fightingStyle: 'TODO',
    player: { maxHp: 0, moveSpeed: 0, light: [], heavy: null, dodge: null, special: null },
    partner: { maxHp: 0, moveSpeed: 0, catchUpSpeed: 0, supportDamage: 0, supportCooldownTicks: 0, animationKey: 'TODO' },
    presentation: { modelKey: parsed.id, portraitKey: parsed.id, animationSetKey: parsed.id, soundSetKey: 'default', specialLabel: 'TODO' },
  };
  const report = `# Creation Report — ${parsed.id}\n\n## Supplied brief\n\n${brief}\n\n## Draft status\n\n- Definition is intentionally incomplete and must not enter the playable registry.\n- Select an implemented Special kind (areaStrike, roar, straightProjectile) before validation.\n- Appearance concept review, model, portrait, clips, integration, and play review are pending.\n${unsupported ? `- Unsupported requested behavior detected: **${unsupported}**. Specify and test new runtime behavior before configuration can support it.\n` : ''}`;
  await mkdir(output, { recursive: true });
  try {
    await writeFile(definitionPath, `${JSON.stringify(draft, null, 2)}\n`, { flag: 'wx' });
    await writeFile(reportPath, report, { flag: 'wx' });
  } catch (error) {
    const { rm } = await import('node:fs/promises');
    await rm(output, { recursive: true, force: true });
    throw error;
  }
  return { definition: definitionPath, report: reportPath };
}

if (import.meta.main) {
  try { const output = await runScaffold(process.argv.slice(2)); console.log(`Draft written: ${output.definition}\nReport written: ${output.report}`); }
  catch (error) { console.error(`Character scaffold failed: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; }
}
