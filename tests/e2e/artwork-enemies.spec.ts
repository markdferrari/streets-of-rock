import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {game,canvasControl,selectDuo} from './helpers/godot';
for(const [role,moves] of Object.entries({grunt:['grunt'],zoner:['throw'],enforcer:['charge'],liam:['close','rope','shockwave']}))test(`${role} samples every attack in both facings with frozen simulation and complete cues`,async({page,browserName})=>{
 await page.setViewportSize({width:844,height:390});await selectDuo(page,'cow','crow');await canvasControl(page,'pause');
 for(const facing of [-1,1])for(const semantic of ['Idle','Hurt',...(role==='liam'?[]:['Stunned']),...moves.flatMap(m=>['windup','active','recovery'].map(p=>`${m}.${p}`)),'Defeated']){
  await page.evaluate(value=>(window as any).__sorTest.command('enemy-art',value),{role,semantic,facing,phase:role==='liam'?2:1});
  await expect.poll(()=>game(page).then(s=>s.enemyArt.views['900']?.pose.semantic)).toBe(semantic);
  const state=await game(page),view=state.enemyArt.views['900'];
  expect(view.pose.facing).toBe(facing);expect(state.enemyArt.errors).toEqual([]);
  expect(view.phaseOverlay).toBe(role==='liam'&&semantic!=='Defeated');
  expect(view.cue.visible).toBe(/\.(windup|active)$/.test(semantic));
  if(semantic.startsWith('shockwave'))expect(view.cue.range).toBe(20);
  const frozen=state.run.tick;await page.waitForTimeout(30);expect((await game(page)).run.tick).toBe(frozen);
  if(semantic===`${moves.at(-1)}.active`){const dir='specs/010-upgrade-game-artwork/reviews/enemies-final/paused-state-checks';mkdirSync(dir,{recursive:true});await page.screenshot({path:`${dir}/${browserName}-${role}-${facing}.png`});}
 }
});
