import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sha256 } from '../../scripts/godot/setup';
import { auditOwnership, modeConfig } from '../../scripts/godot/export';
import { auditFoundationInventory, type FoundationInventory } from '../../scripts/build-asset-inventory';
import { validateFinalEvidence } from '../../scripts/godot/audit';

const inventory = (entries: FoundationInventory['entries']): FoundationInventory => ({ schemaVersion: 1, buildId: 'a'.repeat(64), mode: 'release', engine: { version: '4.7.2', templateSha256: 'b'.repeat(64) }, entrypoint: 'index.html', packMountOrder: [], entries });
describe('complete release audit contracts', () => {
  it('rejects duplicate paths, malformed file identity and unverified engine bytes', () => {
    const entry = { url: 'index.html', sha256: 'c'.repeat(64), bytes: 4, category: 'content' as const };
    expect(() => auditFoundationInventory(inventory([entry, entry]), {})).toThrow(/duplicate|unique/i);
    expect(() => auditFoundationInventory(inventory([{ ...entry, sha256: 'bad' }]), {})).toThrow(/digest|sha-256/i);
    expect(() => auditOwnership({ 'main.pck': { 'res://shared.glb': 'a'.repeat(64) }, 'extras.pck': { 'res://shared.glb': 'b'.repeat(64) } })).toThrow(/conflicting ownership/);
    expect(() => auditOwnership({ 'main.pck': {} }, { 'model.glb.import': 'res://missing.glb' })).toThrow(/missing imported-resource remap/);
  });
  it('requires current-build acceptance evidence and keeps diagnostics isolated by build mode', () => {
    expect(() => validateFinalEvidence('a'.repeat(64), null)).toThrow(/missing.*final acceptance/i);
    expect(() => validateFinalEvidence('a'.repeat(64), { buildId: 'b'.repeat(64), statuses: {} })).toThrow(/build identity/i);
    expect(() => validateFinalEvidence('a'.repeat(64), { buildId: 'a'.repeat(64), statuses: { phones: 'pending' } })).toThrow(/phones.*pass/i);
    expect(modeConfig('release').dir).toBe('dist');
    expect(modeConfig('diagnostics').dir).toBe('dist-diagnostics');
  });
});

const finalKeys = ['phones', 'performance', 'playtest', 'soundtrack', 'offlineUpdate', 'coverage', 'conceptReview', 'inGameReview', 'characterWorkflow'];
function withFinalEvidence(check: (root: string, record: any) => void) {
  const root = mkdtempSync(join(tmpdir(), 'sor-final-evidence-'));
  const buildId = 'a'.repeat(64);
  const record: any = { buildId, statuses: {}, evidence: {}, soundtrack: {
    audioFile: 'public/assets/audio/brightside.mp3', ownerApproved: true,
    title: 'Owner track', license: 'Owner permission to bundle', sha256: sha256('music'),
  } };
  mkdirSync(join(root, 'public/assets/audio'), { recursive: true });
  writeFileSync(join(root, record.soundtrack.audioFile), 'music');
  for (const key of finalKeys) {
    const path = `${key}.md`, bytes = `${key} review for ${buildId}`;
    writeFileSync(join(root, path), bytes);
    record.statuses[key] = 'pass';
    record.evidence[key] = { buildId, path, sha256: sha256(bytes) };
  }
  try { check(root, record); } finally { rmSync(root, { recursive: true, force: true }); }
}
describe('final acceptance evidence integrity', () => {
  it('rejects pass flags without the required art and character reviews', () => {
    const statuses = Object.fromEntries(finalKeys.slice(0, 6).map(key => [key, 'pass']));
    expect(() => validateFinalEvidence('a'.repeat(64), { buildId: 'a'.repeat(64), statuses })).toThrow(/conceptReview.*pass/i);
  });
  it('accepts complete current-build records and rejects missing, stale or changed evidence', () => withFinalEvidence((root, record) => {
    expect(() => validateFinalEvidence(record.buildId, record, root)).not.toThrow();
    record.evidence.phones.buildId = 'b'.repeat(64);
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/phones.*build/i);
    record.evidence.phones.buildId = record.buildId;
    writeFileSync(join(root, 'phones.md'), 'changed');
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/phones.*digest/i);
    delete record.evidence.phones;
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/phones.*evidence/i);
  }));
  it('rejects missing files and references outside the evidence root', () => withFinalEvidence((root, record) => {
    record.evidence.phones.path = 'missing.md';
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/phones.*missing/i);
    record.evidence.phones.path = '../outside.md';
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/phones.*path/i);
  }));
  it('requires owner approval, licensing and the exact bundled soundtrack bytes', () => withFinalEvidence((root, record) => {
    record.soundtrack.ownerApproved = false;
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/soundtrack.*approval/i);
    record.soundtrack.ownerApproved = true;
    record.soundtrack.license = '';
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/soundtrack.*licens/i);
    record.soundtrack.license = 'Owner permission';
    writeFileSync(join(root, record.soundtrack.audioFile), 'replacement');
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/soundtrack.*digest/i);
  }));
});

describe('explicit owner waiver of manual acceptance', () => {
  it('accepts documented manual waivers without reporting a measured pass', () => withFinalEvidence((root, record) => {
    const decision = 'Owner: waive manual acceptance gates and proceed with cutover';
    writeFileSync(join(root, 'waiver.md'), decision);
    record.manualWaiver = { approvedBy: 'owner', buildId: record.buildId, path: 'waiver.md', sha256: sha256(decision), reason: 'Proceed with cutover; phone/player observations remain unverified.' };
    for (const key of ['phones', 'performance', 'playtest', 'offlineUpdate']) record.statuses[key] = 'waived';
    expect(() => validateFinalEvidence(record.buildId, record, root)).not.toThrow();
    expect(record.statuses.performance).toBe('waived');
    record.statuses.soundtrack = 'waived';
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/soundtrack.*pass/i);
  }));
  it('rejects undocumented, stale or changed waiver decisions', () => withFinalEvidence((root, record) => {
    record.statuses.phones = 'waived';
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/waiver.*owner/i);
    writeFileSync(join(root, 'waiver.md'), 'approved');
    record.manualWaiver = { approvedBy: 'owner', buildId: 'b'.repeat(64), path: 'waiver.md', sha256: sha256('approved'), reason: 'Proceed without phone measurements' };
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/waiver.*build/i);
    record.manualWaiver.buildId = record.buildId;
    record.manualWaiver.sha256 = sha256('different');
    expect(() => validateFinalEvidence(record.buildId, record, root)).toThrow(/waiver.*digest/i);
  }));
});
