import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const snapshot=(page:Page)=>page.evaluate(()=>(window as any).__sorArtPilot?.snapshot());
const command=(page:Page,name:string,value?:unknown)=>page.evaluate(({name,value})=>(window as any).__sorArtPilot.command(name,value),{name,value});
async function boot(page:Page){
 await page.setViewportSize({width:844,height:390});await page.goto('/?fixture=enemy-art');
 await expect.poll(()=>snapshot(page).then(state=>state?.ready),{timeout:30000}).toBe(true);
 await command(page,'pause',true);await command(page,'reset');
}
async function button(page:Page,name:string){const b=(await snapshot(page)).buttons[name];await page.locator('canvas').click({position:{x:b.x+b.width/2,y:b.y+b.height/2}});}
test('actual imported skins sample real AI phase boundaries and release the bottle on the simulation tick',async({page})=>{
 const errors:string[]=[];page.on('console',m=>{if(/SCRIPT ERROR|^ERROR:/.test(m.text()))errors.push(m.text());});
 await boot(page);await command(page,'step',1);
 let state=await snapshot(page);expect(state.poses.grunt.semantic).toBe('grunt.windup');expect(state.poses.zoner.semantic).toBe('throw.windup');expect(state.bottleVisible).toBe(true);
 await command(page,'step',26);state=await snapshot(page);expect(state.tick).toBe(27);expect(state.poses.grunt.semantic).toBe('grunt.windup');
 await command(page,'step',1);state=await snapshot(page);expect(state.poses.grunt.semantic).toBe('grunt.active');expect(state.poses.grunt.timeSeconds).toBeCloseTo(.47);
 await command(page,'step',11);state=await snapshot(page);expect(state.tick).toBe(39);expect(state.poses.zoner.semantic).toBe('throw.windup');expect(state.projectileCount).toBe(0);expect(state.bottleVisible).toBe(true);
 await command(page,'step',1);state=await snapshot(page);expect(state.tick).toBe(40);expect(state.poses.zoner.semantic).toBe('throw.active');expect(state.projectileCount).toBe(1);expect(state.bottleVisible).toBe(false);expect(state.releases).toEqual([{tick:40,phase:'active',sampleSeconds:.70}]);
 await command(page,'step',6);state=await snapshot(page);expect(state.poses.zoner.semantic).toBe('throw.recovery');expect(state.errors).toEqual([]);expect(errors).toEqual([]);
});
test('pilot controls switch facing and authored states; pause freezes actual samples',async({page})=>{
 await boot(page);await button(page,'face');await command(page,'step',12);
 expect((await snapshot(page)).poses.grunt.facing).toBe(-1);expect((await snapshot(page)).poses.zoner.facing).toBe(-1);
 for(const [control,semantic] of [['idle','Idle'],['move','Move'],['stun','Stunned'],['hurt','Hurt'],['defeat','Defeated']]){
  await button(page,control!);await command(page,'step',1);const state=await snapshot(page);expect(state.poses.grunt.semantic).toBe(semantic);expect(state.poses.zoner.semantic).toBe(semantic);
 }
 await button(page,'attack');await command(page,'step',15);const before=await snapshot(page);await page.waitForTimeout(200);const after=await snapshot(page);expect(after.tick).toBe(before.tick);expect(after.poses).toEqual(before.poses);
});
test('pilot stays usable at the supported landscape widths and records review captures',async({page,browserName})=>{
 await boot(page);await command(page,'step',20);
 const output='specs/010-upgrade-game-artwork/reviews/kaykit-pilot';mkdirSync(output,{recursive:true});
 for(const viewport of [{width:667,height:375},{width:844,height:390},{width:915,height:412}]){
  await page.setViewportSize(viewport);await expect.poll(()=>snapshot(page).then(s=>Math.max(...Object.values(s.buttons).map((b:any)=>b.x+b.width)))).toBeLessThanOrEqual(viewport.width);
  await expect.poll(()=>page.evaluate(()=>document.querySelector('canvas')!.width)).toBe(await page.evaluate(()=>Math.round(innerWidth*Math.min(devicePixelRatio||1,1.5))));
  const state=await snapshot(page);expect(state.rigCount).toBe(2);expect(state.render.draws).toBeLessThanOrEqual(100);expect(state.render.primitives).toBeLessThanOrEqual(100000);for(const b of Object.values(state.buttons) as any[]){expect(b.width).toBeGreaterThanOrEqual(44);expect(b.y+b.height).toBeLessThanOrEqual(viewport.height);}
  await page.screenshot({path:`${output}/${browserName}-${viewport.width}.png`});writeFileSync(`${output}/${browserName}-${viewport.width}.json`,JSON.stringify(state,null,2)+'\n');
 }
});
