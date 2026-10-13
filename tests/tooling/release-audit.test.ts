import { describe, expect, it } from 'vitest';
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
