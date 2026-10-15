import {test,expect} from '@playwright/test';
import {game,canvasControl,selectDuo} from './helpers/godot';
test('bundled artwork credits return safely to Home and paused settings',async({page})=>{
 await page.setViewportSize({width:667,height:375});await page.goto('/');
 await expect.poll(()=>game(page).then(s=>s?.phase)).toBe('selecting');
 const selection=(await game(page)).selection;
 await canvasControl(page,'artwork-credits');
 await expect(page.getByRole('dialog',{name:'Artwork Credits',exact:true})).toHaveCount(1);
 await expect(page.getByRole('heading')).toContainText('Kenney');
 await expect(page.getByRole('button',{name:'Back',exact:true})).toBeFocused();
 await canvasControl(page,'close-credits');expect((await game(page)).selection).toEqual(selection);
 await selectDuo(page,'cow','crow');await canvasControl(page,'pause');await canvasControl(page,'settings');
 const before=await game(page);await page.getByRole('button',{name:'Artwork Credits',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Back',exact:true})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'Artwork Credits',exact:true})).toBeFocused();
 await canvasControl(page,'close-settings');
 const after=await game(page);expect(after.phase).toBe('paused');expect(after.run.tick).toBe(before.run.tick);expect(after.selection).toEqual(before.selection);
});
