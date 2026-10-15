import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {selectDuo,game} from './helpers/godot';
const ids=['dance-floor','vip-lounge','backstage-corridor','alley-exit'];
const visuals=['exterior','bar','dance-floor','stage-vip'];
const cues=[['frontage','club-sign','neon-doorway','light-spill','pavement','queue-barriers','event-posters'],['long-counter','bottle-shelves','stools','booths','warm-light','neon-accents'],['dance-floor','dj-booth','large-speakers','overhead-fixtures','coloured-light-pools'],['curtains','stage-backdrop','vip-seating','club-branding','dramatic-light']];
for(const width of [667,844,915])for(const [fighter,partner] of width===844?[['lion','plates'],['cow','crow']]:[['lion','plates']])test(`furnished rooms retain landmarks and camera edges at ${width} ${fighter}/${partner}`,async({page,browserName})=>{
 await page.setViewportSize({width,height:width===667?375:width===844?390:412});
 const errors:string[]=[];page.on('console',m=>{if(/SCRIPT ERROR|^ERROR:/.test(m.text()))errors.push(m.text());});
 await selectDuo(page,fighter!,partner!);
 const folder='specs/010-upgrade-game-artwork/reviews/rooms-final';mkdirSync(folder,{recursive:true});const records:unknown[]=[];
 for(let index=0;index<4;index++){
  await page.evaluate(i=>(window as any).__sorTest.command('room',i),index);
  await expect.poll(()=>game(page).then(s=>s.scenery.kind)).toBe('furnished');
  const state=await game(page);expect(state.scenery.rooms).toEqual(ids);expect(state.scenery.visuals).toEqual(visuals);expect(state.scenery.landmarks[ids[index]]).toEqual(cues[index]);expect(state.scenery.meshes).toBeGreaterThan(20);expect(state.scenery.colliders).toBe(0);expect(state.scenery.animations).toBe(0);expect(state.scenery.connectors).toEqual([true,true,true]);
  for(const edge of ['left','right']){
   await page.evaluate(({index,edge})=>(window as any).__sorTest.command('position',{x:index*18+(edge==='left'?0:16),depth:edge==='left'?-3:3}),{index,edge});
   await page.screenshot({path:`${folder}/${browserName}-${width}-${visuals[index]}-${edge}-${fighter}-${partner}.png`});
   const s=await game(page);expect(s.phase).toBe('running');expect(s.scenery.cameraX).toBeCloseTo(s.camera.anchorX,5);expect(s.scenery.visibleRooms).toBe(4);records.push({room:visuals[index],edge,fighter,partner,width,camera:s.camera,scenery:s.scenery});
  }
 }
 writeFileSync(`${folder}/${browserName}-${width}-${fighter}-${partner}.json`,JSON.stringify(records,null,2)+'\n');
 expect(errors).toEqual([]);
});
