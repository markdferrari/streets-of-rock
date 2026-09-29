import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { requiredCharacterClips } from '../../../src/content/animation-clips';
import { auditBuild, generateInventory } from '../../../scripts/build-asset-inventory';

const directories: string[] = [];
afterEach(() => { for (const path of directories.splice(0)) rmSync(path, { recursive: true, force: true }); });

function glb(names: readonly string[]): Buffer {
  const json = Buffer.from(JSON.stringify({ animations: names.map(name => ({ name })) }));
  const padded = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
  const file = Buffer.alloc(20 + padded.length);
  file.write('glTF'); file.writeUInt32LE(2, 4); file.writeUInt32LE(file.length, 8);
  file.writeUInt32LE(padded.length, 12); file.write('JSON', 16); padded.copy(file, 20);
  return file;
}

function fixture(): string {
  const dir = mkdtempSync(join(tmpdir(), 'sor-audit-')); directories.push(dir);
  const files: Record<string, Buffer | string> = {
    'index.html': '<script src="/assets/index.js"></script>', 'registerSW.js': 'navigator.serviceWorker',
    'manifest.webmanifest': '{}', 'assets/index.js': 'console.log("game")', 'assets/index.css': 'body{}',
    'assets/cow.png': 'portrait', 'assets/crow.png': 'portrait',
    'assets/cow.glb': glb(requiredCharacterClips('cow')),
    'assets/crow.glb': glb(requiredCharacterClips('crow')),
    'assets/audio/music-placeholder.wav': 'RIFF',
    'assets/icons/icon.svg': '<svg/>', 'assets/icons/icon-maskable.svg': '<svg/>',
  };
  for (const [name, value] of Object.entries(files)) {
    const path = join(dir, name); mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, value);
  }
  writeFileSync(join(dir, 'sw.js'), `const precache=${JSON.stringify(Object.keys(files).map(url => ({ url, revision: null })))};`);
  generateInventory(dir);
  return dir;
}

describe('production build audit', () => {
  it('accepts complete assets but keeps final soundtrack evidence pending', () => {
    const dir = fixture();
    expect(auditBuild(dir).files).toBe(12);
    expect(() => auditBuild(dir, { requireFinalTrack: true })).toThrow('intended soundtrack');
  });
  it('rejects omitted precache entries and missing action clips', () => {
    const dir = fixture();
    writeFileSync(join(dir, 'sw.js'), 'const precache=[{"url":"index.html","revision":null}];');
    expect(() => auditBuild(dir)).toThrow('precache');
    const complete = fixture();
    writeFileSync(join(complete, 'assets/crow.glb'), glb(['Idle']));
    generateInventory(complete);
    expect(() => auditBuild(complete)).toThrow('crow model lacks');
  });
  it('rejects production hooks, modified revisions, and oversized assets', () => {
    const dir = fixture();
    writeFileSync(join(dir, 'assets/index.js'), '__sorTest');
    generateInventory(dir);
    expect(() => auditBuild(dir)).toThrow('test hook');
    const oversized = fixture();
    writeFileSync(join(oversized, 'assets/oversized.bin'), Buffer.alloc(16 * 1024 * 1024 + 1));
    generateInventory(oversized);
    expect(() => auditBuild(oversized)).toThrow('16 MiB');
  });
});
