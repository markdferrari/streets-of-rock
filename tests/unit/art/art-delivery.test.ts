import {it,expect} from 'vitest';
import {partitionEntries,auditArtDelivery} from '../../../scripts/art/delivery';
it('splits actual exported entries once, keeps bootstrap first and detects missing art or credits',()=>{
 const entries=[{path:'res://game/app/bootstrap.gd',bytes:2},{path:'res://project.binary',bytes:2},{path:'res://room.scn',bytes:4},{path:'res://enemy.scn',bytes:4}];
 const packs=partitionEntries(entries,7);
 expect(packs.length).toBeGreaterThan(1);expect(packs.flat().sort()).toEqual(entries.map(e=>e.path).sort());
 expect(packs[0]).toContain('res://game/app/bootstrap.gd');expect(packs[0]).toContain('res://project.binary');
 expect(()=>partitionEntries([{path:'x',bytes:8}],7)).toThrow(/cap/);
 const resources={art:{room:{path:'room.scn',dependencyIds:['palette']},palette:{path:'palette.tres'}}};
 expect(()=>auditArtDelivery(['res://room.scn'],resources)).toThrow(/palette|credit/);
 expect(()=>auditArtDelivery(['res://room.scn','res://palette.tres','res://public/assets/credits/art-credits.json','res://public/assets/credits/ARTWORK-NOTICES.txt'],resources)).not.toThrow();
});

import {finalEvidencePath} from '../../../scripts/godot/audit';
it('selects explicit feature acceptance without reusing the inherited waiver or escaping the project',()=>{
 expect(finalEvidencePath()).toBe('specs/009-godot-rewrite/validation/acceptance.json');
 expect(finalEvidencePath('specs/010-upgrade-game-artwork/validation/acceptance.json')).toBe('specs/010-upgrade-game-artwork/validation/acceptance.json');
 for(const path of ['', '../acceptance.json','/tmp/acceptance.json','specs\\acceptance.json'])expect(()=>finalEvidencePath(path)).toThrow(/evidence.*path/i);
});
