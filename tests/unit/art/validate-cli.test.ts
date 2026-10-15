import { describe, expect, it } from 'vitest';
import { validateArt } from '../../../scripts/art/validate';
import { runArtTests } from '../../../scripts/art/test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('art CLI delegation and usage', () => {
 it('delegates full/focused/default imported and explicit incomplete definition checks with an absolute fixture root', () => {
  const root = mkdtempSync(join(tmpdir(), 'art-cli-'));
  try {
   mkdirSync(join(root, 'game/tools'), {recursive:true});
   writeFileSync(join(root, 'project.godot'), 'config_version=5');
   writeFileSync(join(root, 'game/tools/validate_art.gd'), '');
   for (const filter of [[], ['--room','exterior'], ['--enemy','liam'], ['--definitions-only']]) {
    const calls: string[][] = [];
    const r = validateArt(['--root',root,...filter], args => {calls.push(args);return {status:0,output:'Valid fixture'};});
    expect(r.status).toBe(0);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual(expect.arrayContaining(['--path',root,'res://game/tools/validate_art.gd',...filter]));
    if (filter.includes('--definitions-only')) expect(r.output).toMatch(/incomplete.*release/i);
   }
  } finally {rmSync(root,{recursive:true,force:true});}
 });
 it('propagates validation failures and never falls back after an import failure', () => {
  let calls = 0;
  const r = validateArt([], () => {calls++;return {status:1,output:'liam.clipBindings: missing imported clip'};});
  expect(calls).toBe(1);expect(r.status).toBe(1);expect(r.output).toContain('liam.clipBindings');
 });
 it('rejects missing values, unknown/duplicate options and conflicting or unknown focus IDs before invoking Godot', () => {
  for (const args of [['--room','missing'],['--enemy','missing'],['--room','exterior','--enemy','liam'],['--wat'],['--room'],['--root'],['--root','--definitions-only'],['--enemy','grunt','--enemy','liam']]) {
   let calls = 0;const r = validateArt(args, () => {calls++;return {status:0,output:''};});
   expect(r.status, args.join(' ')).toBe(2);expect(r.output).toMatch(/unknown|requires|cannot|duplicate/i);expect(calls).toBe(0);
  }
 });
 it('reports missing project setup and unavailable engine as exit 2', () => {
  expect(validateArt(['--root','/does-not-exist']).status).toBe(2);
  expect(validateArt([], () => {throw new Error('spawn ENOENT');}).status).toBe(2);
 });
});
describe('focused art test runner', () => {
 it('runs both GUT and Vitest scopes and propagates either runner failure', () => {
  for (const failure of [0,1,-1]) {
   const commands: string[][]=[];
   const r=runArtTests(command=>{commands.push(command);return {status:commands.length-1===failure?1:0,output:'scope result'};});
   expect(commands).toHaveLength(2);
   expect(commands[0].join(' ')).toContain('res://tests/godot/art');
   expect(commands[1].join(' ')).toContain('tests/unit/art');
   expect(commands[1].slice(0,2)).toEqual(['node','node_modules/vitest/vitest.mjs']);
   expect(r.status).toBe(failure===-1?0:1);
  }
 });
});
it('does not treat an empty child-runner report as a passing suite', () => {
 expect(runArtTests(()=>({status:0,output:''})).status).toBe(1);
});
it('does not accept an empty validator report as successful validation', () => {
 expect(validateArt([],()=>({status:0,output:''})).status).toBe(1);
});
