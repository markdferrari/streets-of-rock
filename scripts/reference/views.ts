import {chromium} from '@playwright/test';
import {enterRun} from '../../tests/e2e/helpers/selection';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch();const records=[];
for(const [width,height] of [[667,375],[844,390],[915,412]] as const){
 const page=await browser.newPage({viewport:{width,height}});await page.goto('http://127.0.0.1:4180');
 await enterRun(page,'Cow','Crow');
 await page.evaluate(()=>{(window as any).__sorTest.stagePlayerHit();});
 mkdirSync('specs/009-godot-rewrite/validation/evidence/reference-views',{recursive:true});
 const path=`specs/009-godot-rewrite/validation/evidence/reference-views/${width}x${height}.png`;
 await page.screenshot({path});records.push({width,height,path,referenceCommit:'58137537a7d4ef992bd27e3fdf7efe92e5e2add1',snapshot:await page.evaluate(()=>(window as any).__sorTest.snapshot())});await page.close();
}
writeFileSync('specs/009-godot-rewrite/validation/evidence/reference-views/manifest.json',JSON.stringify(records,null,2)+'\n');await browser.close();
