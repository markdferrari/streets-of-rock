import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, cp, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runValidate, validateFiles,runAuthoritativeValidate } from '../../scripts/characters/validate';
import cow from '../../content/characters/cow.json';
import crow from '../../content/characters/crow.json';

async function rootFixture() {
  const root = await mkdtemp(join(tmpdir(), 'sor-character-contract-'));
  const directory = join(root, 'content/characters'); await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'cow.json'), JSON.stringify(cow)); await writeFile(join(directory, 'crow.json'), JSON.stringify(crow));
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
  it('supports full and per-character validation under --root and always checks bundled files', async () => {
    const root = await rootFixture();
    await expect(runValidate(['--full', '--root', root], process.cwd(), false)).resolves.toMatch(/2 character definitions valid/);
    await expect(runValidate(['--character', 'cow', '--root', root], process.cwd(), false)).resolves.toMatch(/1 character definition valid/);
    await expect(runValidate(['--character', 'cow', '--root', root], process.cwd(), true)).rejects.toThrow(/required file is missing/);
    await expect(validateFiles(root, 'missing', false)).rejects.toThrow(/definition file is missing/);
  });
  it('rejects conflicting modes and unsupported mechanics with actionable diagnostics', async () => {
    const root = await rootFixture();
    await expect(runValidate(['--full', '--character', 'cow'], process.cwd(), false)).rejects.toThrow(/cannot combine/);
    await expect(runValidate(['--wat'], root)).rejects.toThrow(/unknown argument/i);
    await expect(runValidate(['--character', '../cow'], root)).rejects.toThrow(/kebab-case/i);
    expect(()=>runAuthoritativeValidate(['--character'])).toThrow(/requires a character ID/);
    expect(()=>runAuthoritativeValidate(['--root',root])).toThrow(/Godot project/);
  });
});
