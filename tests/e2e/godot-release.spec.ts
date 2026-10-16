import {test,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
test('plain HTTP LAN origin boots and plays without secure audio or service workers',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Chromium checks the actual insecure-origin capabilities.');
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(/SCRIPT ERROR|^ERROR:|addModule/.test(message.text()))errors.push(message.text());});
 await page.route('http://sor-lan.test/**',async route=>{
  const url=new URL(route.request().url());
  const response=await page.request.get(`http://127.0.0.1:4182${url.pathname}${url.search}`);
  await route.fulfill({response});
 });
 await page.setViewportSize({width:844,height:390});await page.goto('http://sor-lan.test/');
 expect(await page.evaluate(()=>window.isSecureContext)).toBe(false);
 await expect(page.locator('#boot')).toBeHidden({timeout:20000});
 for(const name of ['Cow','Cow','Crow','Crow']){await page.getByRole('button',{name,exact:true}).focus();await page.keyboard.press('Enter');}
 await expect(page.getByRole('button',{name:'Light',exact:true})).toBeEnabled({timeout:10000});
 await page.getByRole('button',{name:'Light',exact:true}).focus();await page.keyboard.press('Enter');
 expect(await page.evaluate(async()=>(window as any).SorBrowser.cacheStatus())).toMatchObject({state:'error',error:'Error: Offline play requires HTTPS or localhost.'});
 expect(errors).toEqual([]);
});
for(const fixture of ['enemy-art','hero-animation'])test(`actual Release ignores ${fixture} and cannot register test or diagnostics hooks`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/SCRIPT ERROR|^ERROR:/.test(m.text()))errors.push(m.text());});await page.goto(`/?test=1&diagnostics=1&fixture=${fixture}`);
 await expect(page.locator('#boot')).toBeHidden({timeout:60000});
 expect(await page.evaluate(()=>[typeof (window as any).__sorTest,typeof (window as any).__sorDiagnostics,typeof (window as any).__sorArtPilot,typeof (window as any).__sorHeroReview])).toEqual(['undefined','undefined','undefined','undefined']);
 for(const name of ['Cow','Cow','Crow','Crow']){await page.getByRole('button',{name,exact:true}).focus();await page.keyboard.press('Enter');}
 await expect(page.getByRole('button',{name:'Light',exact:true})).toBeEnabled({timeout:10000});
 await page.getByRole('button',{name:'Light',exact:true}).focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:'Pause',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Resume',exact:true})).toBeEnabled();
 expect(errors).toEqual([]);
});
test('Web Diagnostics downloads a bounded structured report after active gameplay',async({page,browserName})=>{
 test.skip(process.env.SOR_RELEASE_DIR!=='dist-diagnostics','Requires the isolated Web Diagnostics export.');
 await page.setViewportSize({width:844,height:390});await page.goto('/');
 await expect(page.locator('#boot')).toBeHidden({timeout:60000});
 for(const name of ['Lion','Lion','Plates','Plates']){await page.getByRole('button',{name,exact:true}).focus();await page.keyboard.press('Enter');}
 await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeEnabled({timeout:10000});
 await page.waitForTimeout(1200);
 await page.getByRole('button',{name:'Pause',exact:true}).focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:'Settings',exact:true}).focus();await page.keyboard.press('Enter');
 const downloadEvent=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download diagnostics'}).focus();await page.keyboard.press('Enter');
 const download=await downloadEvent,path=await download.path();expect(path).toBeTruthy();
 const report=JSON.parse(await readFile(path!,'utf8'));
 expect(report.schemaVersion).toBe(1);expect(report.sampleCount).toBeGreaterThan(0);expect(report.sampleCount).toBeLessThanOrEqual(120);
 expect(report.frameIntervalsMs).toHaveLength(report.sampleCount);expect(report.rollingFps).toBeGreaterThan(0);
 expect(report.drawCalls).toBeGreaterThanOrEqual(0);expect(report.triangles).toBeGreaterThanOrEqual(0);expect(report.ownedResources).toBeGreaterThan(0);
 expect(report.textureBytes).toBeGreaterThanOrEqual(0);expect(report.textureCount).toBeGreaterThanOrEqual(0);expect(report.meshes).toBeGreaterThan(0);expect(report.renderDensity).toBeGreaterThanOrEqual(0);
 const folder='specs/010-upgrade-game-artwork/validation/evidence/complete-art';await mkdir(folder,{recursive:true});
 await writeFile(`${folder}/${browserName}-diagnostics.json`,JSON.stringify({buildId:await page.evaluate(()=>(window as any).SorBoot.buildId),context:'Desktop browser diagnostics; phone performance remains pending',report},null,2)+'\n');
 expect(await page.evaluate(()=>typeof (window as any).__sorTest)).toBe('undefined');
});
