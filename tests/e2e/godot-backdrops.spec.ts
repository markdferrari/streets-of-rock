import {test,expect,type Page} from '@playwright/test';
const snapshot=(page:Page)=>page.evaluate(()=>(window as any).__sorTest?.snapshot());
async function control(page:Page,id:string){const b=(await snapshot(page)).bounds[id];await page.locator('canvas').click({position:{x:b.x+b.width/2,y:b.y+b.height/2}});}
async function select(page:Page,url='/'){await page.goto(url);await expect.poll(()=>snapshot(page).then(s=>s?.phase)).toBe('selecting');for(const id of ['cow','cow','plates','plates'])await control(page,`character-${id}`);await expect.poll(()=>snapshot(page).then(s=>s.phase),{timeout:10000}).toBe('running');}
async function command(page:Page,name:string,value?:unknown){await page.evaluate(({name,value})=>(window as any).__sorTest.command(name,value),{name,value});}
const ids=['dance-floor','vip-lounge','backstage-corridor','alley-exit'];
function overlaps(a:any,b:any){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
for(const viewport of [{width:667,height:375},{width:844,height:390},{width:915,height:412}])test(`all four settings retain camera, safe controls and static scenery at ${viewport.width}`,async({page})=>{
 await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});const errors:string[]=[];page.on('console',m=>{if(/SCRIPT ERROR|^ERROR:/.test(m.text()))errors.push(m.text());});await select(page);
 const canvas=await page.locator('canvas').boundingBox();expect(canvas!.width).toBeGreaterThanOrEqual(viewport.width*.9);expect(canvas!.height).toBeGreaterThanOrEqual(viewport.height*.9);
 for(let index=0;index<4;index++){
  await command(page,'room',index);await expect.poll(()=>snapshot(page).then(s=>[s.run.areaIndex,s.run.encounter.status])).toEqual([index,'active']);const s=await snapshot(page);
  expect(s.scenery.textures).toBe(8);expect(s.scenery.rooms).toEqual(ids);expect(s.scenery.visibleRooms).toBe(4);expect(s.scenery.colliders).toBe(0);expect(s.scenery.animations).toBe(0);expect(s.scenery.connectors).toEqual([true,true,true]);expect(s.environment.reducedMotion).toBe(true);expect(s.scenery.cameraX).toBeCloseTo(s.camera.anchorX,5);
  // Source tables appear on bar entry and remain in the run afterward.
  expect(s.run.tables.map((t:any)=>t.position)).toEqual(index===0?[]:[{x:22,depth:-2},{x:28,depth:2}]);expect(s.go.text).toBe('');
  for(const id of ['light','heavy','dodge','special','pause']){const b=s.bounds[id];expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);expect(b.x).toBeGreaterThanOrEqual(s.environment.safeInsets.left);expect(b.y).toBeGreaterThanOrEqual(s.environment.safeInsets.top);expect(b.x+b.width).toBeLessThanOrEqual(viewport.width-s.environment.safeInsets.right);expect(b.y+b.height).toBeLessThanOrEqual(viewport.height-s.environment.safeInsets.bottom);}
 }
 expect(errors).toEqual([]);
});
test('all three actual clearance/connector transitions preserve GO rules, waves and retry',async({page})=>{
 await page.setViewportSize({width:844,height:390});await select(page);
 for(let room=0;room<3;room++){
  await expect.poll(()=>snapshot(page).then(s=>s.run.areaIndex)).toBe(room);
  for(let wave=0;wave<(room===2?1:2);wave++){
   await expect.poll(()=>snapshot(page).then(s=>[s.run.encounter.waveIndex,s.run.encounter.status])).toEqual([wave,'active']);await command(page,'clear-wave');
  }
  await expect.poll(()=>snapshot(page).then(s=>s.go.text)).toBe('GO');const s=await snapshot(page);for(const b of Object.values(s.bounds))expect(overlaps(s.go.bounds,b)).toBe(false);
  await control(page,'pause');await expect.poll(()=>snapshot(page).then(s=>s.phase)).toBe('paused');const paused=await snapshot(page);expect(paused.go.text).toBe('GO');for(const b of Object.values(paused.bounds))expect(overlaps(paused.go.bounds,b)).toBe(false);await control(page,'resume');await expect.poll(()=>snapshot(page).then(s=>s.phase)).toBe('running');
  // Place the allies at this cleared connector, then use native movement for entry.
  await command(page,'position',{x:17+room*18,depth:0});expect((await snapshot(page)).run.areaIndex).toBe(room);
  await page.keyboard.down('d');await expect.poll(()=>snapshot(page).then(s=>s.run.areaIndex)).toBe(room+1);await page.keyboard.up('d');await expect.poll(()=>snapshot(page).then(s=>s.go.text)).toBe('');
 }
 await expect.poll(()=>snapshot(page).then(s=>s.run.actors.some((a:any)=>a.role==='liam'&&a.hp>0))).toBe(true);await command(page,'clear-wave');await expect.poll(()=>snapshot(page).then(s=>s.phase)).toBe('victory');expect((await snapshot(page)).go.text).toBe('');await control(page,'retry');await expect.poll(()=>snapshot(page).then(s=>s.phase),{timeout:10000}).toBe('running');expect((await snapshot(page)).run.areaIndex).toBe(0);expect((await snapshot(page)).go.text).toBe('');expect((await snapshot(page)).scenery.textures).toBe(8);
});
test('local room review links preserve real selection and load the requested final scene',async({page})=>{
 await page.setViewportSize({width:844,height:390});await select(page,'/?review=rooms&room=1');
 await expect.poll(()=>snapshot(page).then(s=>[s.run.areaIndex,s.run.encounter.status])).toEqual([1,'active']);
 expect((await snapshot(page)).run.duo).toEqual({fighterId:'cow',partnerId:'plates'});
 expect((await snapshot(page)).scenery.textures).toBe(8);
});
