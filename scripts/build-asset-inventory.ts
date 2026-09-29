import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { requiredCharacterClips } from '../src/content/animation-clips';

export interface InventoryAsset { readonly url: string; readonly revision: string; readonly bytes: number }
export interface AssetInventory { readonly buildId: string; readonly assets: readonly InventoryAsset[] }

function hash(data: Buffer | string): string { return createHash('sha256').update(data).digest('hex'); }

function filesUnder(dir: string, base = dir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path, base) : [relative(base, path).replaceAll('\\', '/')];
  }).sort();
}

export function generateInventory(dir = 'dist'): AssetInventory {
  if (!existsSync(join(dir, 'sw.js'))) throw new Error('Build inventory requires dist/sw.js');
  const assets = filesUnder(dir).filter(name => name !== 'sw.js' && name !== 'asset-inventory.json').map(url => {
    const data = readFileSync(join(dir, url));
    return { url, revision: hash(data), bytes: data.byteLength };
  });
  const inventory = { buildId: hash(readFileSync(join(dir, 'sw.js'))).slice(0, 16), assets };
  writeFileSync(join(dir, 'asset-inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
  return inventory;
}

function animationNames(path: string): Set<string> {
  const bytes = readFileSync(path);
  if (bytes.length < 20 || bytes.toString('ascii', 0, 4) !== 'glTF' || bytes.readUInt32LE(4) !== 2 ||
      bytes.toString('ascii', 16, 20) !== 'JSON') throw new Error(`${path} is not a GLB 2.0 model`);
  const length = bytes.readUInt32LE(12);
  const document = JSON.parse(bytes.toString('utf8', 20, 20 + length)) as { animations?: { name: string }[] };
  return new Set(document.animations?.map(animation => animation.name) ?? []);
}

export function auditBuild(dir = 'dist', options: { requireFinalTrack?: boolean } = {}): { files: number; bytes: number } {
  const inventory = JSON.parse(readFileSync(join(dir, 'asset-inventory.json'), 'utf8')) as AssetInventory;
  const actual = filesUnder(dir).filter(name => name !== 'sw.js' && name !== 'asset-inventory.json');
  const listed = inventory.assets.map(asset => asset.url).sort();
  if (JSON.stringify(actual) !== JSON.stringify(listed)) throw new Error('Inventory does not cover every shipped asset');
  let total = 0;
  for (const asset of inventory.assets) {
    const data = readFileSync(join(dir, asset.url));
    if (data.byteLength > 16 * 1024 * 1024) throw new Error(`${asset.url} exceeds 16 MiB`);
    if (data.byteLength !== asset.bytes || hash(data) !== asset.revision) throw new Error(`${asset.url} revision or size changed`);
    total += data.byteLength;
    if (asset.url.endsWith('.js') && (/__sorTest|__sorDiagnostics|tests\/fixtures|VITE_TEST_MODE|VITE_DIAGNOSTICS/.test(data.toString()))) {
      throw new Error(`${asset.url} contains a production test hook or fixture`);
    }
  }
  if (total > 30 * 1024 * 1024) throw new Error('Required build assets exceed 30 MiB');
  const urls = new Set([...readFileSync(join(dir, 'sw.js'), 'utf8').matchAll(/"url":"([^"]+)"/g)].map(match => match[1]!));
  for (const asset of inventory.assets) if (!urls.has(asset.url)) throw new Error(`Missing precache entry: ${asset.url}`);
  const keys = ['cow', 'crow', 'lion', 'plates'] as const;
  const glbs = inventory.assets.filter(asset => asset.url.endsWith('.glb'));
  const portraits = inventory.assets.filter(asset => asset.url.endsWith('.png'));
  for (const key of ['cow', 'crow']) {
    if (!portraits.some(asset => new RegExp(`^assets/${key}(?:-[^.]+)?\\.png$`).test(asset.url))) {
      throw new Error(`Missing ${key} portrait`);
    }
  }
  if (portraits.length < keys.length) throw new Error('Missing Lion or Plates portrait');
  for (const key of keys) {
    const direct = glbs.find(asset => asset.url === `assets/${key}.glb` ||
      new RegExp(`(?:^|/)${key}(?:/|-[^/]*\\.glb$)`).test(asset.url) && /\\.glb$/.test(asset.url));
    const expectedClips = requiredCharacterClips(key);
    const model = direct ?? glbs.find(asset => animationNames(join(dir, asset.url)).has(expectedClips.find(clip => /^(lion1|plates1|crow1|cow1)\.windup$/.test(clip))!));
    if (!model) throw new Error(`Missing ${key} model`);
    const clips = animationNames(join(dir, model.url));
    for (const clip of expectedClips) if (!clips.has(clip)) throw new Error(`${key} model lacks ${clip}`);
  }
  if (!glbs.some(asset => /(?:^|\/)headrest(?:-[^/]+)?\.glb$/.test(asset.url))) throw new Error('Missing headrest prop');
  for (const required of ['index.html', 'manifest.webmanifest', 'assets/icons/icon.svg', 'assets/icons/icon-maskable.svg']) {
    if (!urls.has(required)) throw new Error(`Missing required precache asset: ${required}`);
  }
  const music = inventory.assets.filter(asset => /^assets\/audio\/.*\.(wav|mp3|ogg|m4a)$/.test(asset.url));
  if (!music.length) throw new Error('Missing bundled music');
  if (options.requireFinalTrack) {
    const evidencePath = join(dir, 'track-evidence.json');
    if (!existsSync(evidencePath) || music.every(asset => asset.url.includes('placeholder'))) throw new Error('Missing intended soundtrack evidence');
    const evidence = JSON.parse(readFileSync(evidencePath, 'utf8')) as { ownerApproved?: boolean; audioFile?: string };
    if (evidence.ownerApproved !== true || !music.some(asset => asset.url === evidence.audioFile)) throw new Error('Missing intended soundtrack evidence');
  }
  return { files: inventory.assets.length, bytes: total };
}

if (import.meta.main) {
  const result = generateInventory(process.argv[2] ?? 'dist');
  console.log(`Inventory ${result.buildId}: ${result.assets.length} assets`);
}
