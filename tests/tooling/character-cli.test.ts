import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, cp, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runAuthoritativeValidate } from '../../scripts/characters/validate';

async function rootFixture() {
  const root = await mkdtemp(join(tmpdir(), 'sor-character-contract-'));
  await cp('project.godot', join(root, 'project.godot'));
  await cp('content', join(root, 'content'), { recursive: true });
  for (const directory of ['game', '.godot', 'addons', 'assets', 'public']) await symlink(join(process.cwd(), directory), join(root, directory), 'dir');
  return root;
}
describe('character validator CLI contract', () => {
  it('validates a different Godot project root and propagates malformed definition failures',async()=>{
    const root=await mkdtemp(join(tmpdir(),'sor-godot-validator-'));
    try{
      await cp('project.godot',join(root,'project.godot'));await cp('content',join(root,'content'),{recursive:true});
      for(const directory of ['game','.godot','addons','assets','public'])await symlink(join(process.cwd(),directory),join(root,directory),'dir');
      expect(runAuthoritativeValidate(['--root',root,'--character','plates'])).toMatch(/Valid: plates definition.*imported resources/);
      const definition=JSON.parse(await readFile(join(root,'content/characters/plates.json'),'utf8'));definition.player.special.kind='unsupported';
      await writeFile(join(root,'content/characters/plates.json'),JSON.stringify(definition));
      expect(()=>runAuthoritativeValidate(['--root',root,'--character','plates'])).toThrow(/special.*unsupported|unsupported.*special/i);
      await cp('content/characters/plates.json',join(root,'content/characters/plates.json'));
      const resources=JSON.parse(await readFile(join(root,'content/resources.json'),'utf8'));
      resources.portraits.plates=resources.models.plates;
      await writeFile(join(root,'content/resources.json'),JSON.stringify(resources));
      expect(()=>runAuthoritativeValidate(['--root',root,'--character','plates'])).toThrow(/plates.*portrait.*imported/i);
    }finally{await rm(root,{recursive:true,force:true});}
  });
  it('runs the actual imported validator for the full roster and per-character root',()=>{
    expect(runAuthoritativeValidate(['--full'])).toMatch(/Valid: 4 character definitions/);
    expect(runAuthoritativeValidate(['--character','lion','--root',process.cwd()])).toMatch(/Valid: lion definition/);
    expect(()=>runAuthoritativeValidate(['--character','missing'])).toThrow(/definition file is missing/);
  });
  it('supports full/per-character roots and always checks bundled files', async () => {
    const root = await rootFixture();
    try {
      expect(runAuthoritativeValidate(['--full', '--root', root])).toMatch(/Valid: 4 character definitions/);
      expect(runAuthoritativeValidate(['--character', 'cow', '--root', root])).toMatch(/Valid: cow definition/);
      const resources = JSON.parse(await readFile(join(root, 'content/resources.json'), 'utf8'));
      resources.models.cow = 'assets/missing-cow.glb';
      await writeFile(join(root, 'content/resources.json'), JSON.stringify(resources));
      expect(() => runAuthoritativeValidate(['--character', 'cow', '--root', root])).toThrow(/required.*file.*missing/);
      expect(() => runAuthoritativeValidate(['--character', 'missing', '--root', root])).toThrow(/definition file is missing/);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
  it('rejects conflicting modes and invalid arguments with actionable diagnostics', async () => {
    const emptyRoot = await mkdtemp(join(tmpdir(), 'sor-invalid-project-'));
    try {
      expect(() => runAuthoritativeValidate(['--full', '--character', 'cow'])).toThrow(/cannot combine/);
      expect(() => runAuthoritativeValidate(['--wat'])).toThrow(/unknown argument/i);
      expect(() => runAuthoritativeValidate(['--character', '../cow'])).toThrow(/kebab-case/i);
      expect(() => runAuthoritativeValidate(['--character'])).toThrow(/requires a character ID/);
      expect(() => runAuthoritativeValidate(['--root', emptyRoot])).toThrow(/Godot project/);
    } finally { await rm(emptyRoot, { recursive: true, force: true }); }
  });
});
