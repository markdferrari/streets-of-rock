import { test, expect } from '@playwright/test';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {readdirSync,readFileSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {chooseDuo} from './helpers/selection';
const readiness = (page: import('@playwright/test').Page) => page.evaluate(() => (window as any).__sorTest?.snapshot()?.readiness ?? null);
test('verified cache launches offline and returning saved values survive reload', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit offline emulation is unavailable here; physical Safari remains required.');
  await page.addInitScript(() => {
    localStorage.setItem('sor.settings.v1', JSON.stringify({ schemaVersion: 1, musicVolume: 0.4, effectsVolume: 0.6, screenShake: false }));
    localStorage.setItem('streets-of-rock.best.v1', JSON.stringify({ schemaVersion: 1, bestSuccessfulMs: 43210 }));
    localStorage.setItem('streets-of-rock.tutorial.v1', JSON.stringify({ schemaVersion: 1, completed: ['movement', 'attack'] }));
  });
  await page.setViewportSize({ width: 844, height: 390 }); await page.goto('/');
  await expect.poll(() => readiness(page).then((state: any) => state?.runtime ?? 'loading'), { timeout: 60000 }).toBe('ready');
  await expect.poll(() => readiness(page).then((state: any) => state?.offline ?? 'loading'), { timeout: 60000 }).toBe('ready');
  await expect.poll(() => page.evaluate(() => (window as any).__sorTest.snapshot().settings.musicVolume)).toBe(0.4);
  await page.reload();
  await expect.poll(() => page.evaluate(() => (window as any).__sorTest?.snapshot()?.settings.screenShake),{timeout:60000}).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('streets-of-rock.best.v1'))).toContain('43210');
  await context.setOffline(true);
  const cold = await context.newPage(); await cold.setViewportSize({ width: 844, height: 390 }); await cold.goto('/');
  await expect.poll(() => cold.locator('#semantics [data-control-id="character-cow"]').count(), { timeout: 60000 }).toBe(1);
  expect(await cold.evaluate(() => (window as any).__sorTest.snapshot().phase)).toBe('selecting');
  expect(await cold.evaluate(() => (window as any).__sorTest.snapshot().settings.effectsVolume)).toBe(0.6);
  for(const [fighter,partner] of [['Cow','Crow'],['Crow','Lion'],['Lion','Plates'],['Plates','Cow']]){
    await expect(cold.locator('#semantics [data-control-id^="character-"]')).toHaveCount(4);
    for(const name of [fighter,fighter,partner,partner]){await cold.getByRole('button',{name,exact:true}).focus();await cold.keyboard.press('Enter');}
    await expect.poll(()=>cold.evaluate(()=>(window as any).__sorTest.snapshot().phase),{timeout:10000}).toBe('running');
    for(const room of [0,1,2,3]){
      await cold.evaluate(room=>(window as any).__sorTest.command('room',room),room);
      await expect.poll(()=>cold.evaluate(()=>(window as any).__sorTest.snapshot().run.areaIndex)).toBe(room);
      expect(await cold.evaluate(()=>(window as any).__sorTest.snapshot().scenery.textures)).toBe(0);
    }
    await cold.evaluate(()=>(window as any).__sorTest.command('victory'));
    await expect.poll(()=>cold.evaluate(()=>(window as any).__sorTest.snapshot().phase)).toBe('victory');
    await cold.getByRole('button',{name:'Home',exact:true}).focus();await cold.keyboard.press('Enter');
  }
  await context.setOffline(false);
});

function fixtureTree(root:string):{fileCount:number;treeSha256:string} {
  const files=(dir:string,base=dir):string[]=>readdirSync(dir,{withFileTypes:true}).filter(item=>item.name!=='.gdignore').flatMap(item=>item.isDirectory()?files(join(dir,item.name),base):[join(dir,item.name).slice(base.length+1)]).sort();
  const entries=files(root).map(path=>[path,createHash('sha256').update(readFileSync(join(root,path))).digest('hex')]);
  return {fileCount:entries.length,treeSha256:createHash('sha256').update(JSON.stringify(entries)).digest('hex')};
}
function staticServer() {
  const legacy=resolve('tests/reference/releases/legacy'),godot=resolve('tests/reference/releases/godot');
  const oldFixture=JSON.parse(readFileSync('tests/reference/releases/legacy.json','utf8'));
  const newFixture=JSON.parse(readFileSync('tests/reference/releases/godot.json','utf8'));
  for(const [root,fixture] of [[legacy,oldFixture],[godot,newFixture]] as const){
    const tree=fixtureTree(root);expect(tree.fileCount).toBe(fixture.fileCount);expect(tree.treeSha256).toBe(fixture.treeSha256);
    const inventory=JSON.parse(readFileSync(join(root,root===legacy?'asset-inventory.json':`releases/${fixture.buildId}/asset-inventory.json`),'utf8'));
    expect(inventory.buildId).toBe(fixture.buildId);
  }
  let active=legacy;
  const server=createServer(async(request,response)=>{
    const pathname=decodeURIComponent(new URL(request.url??'/', 'http://localhost').pathname);
    const file=resolve(active,`.${pathname==='/'?'/index.html':pathname}`);
    if(!file.startsWith(active+sep)){response.writeHead(403).end();return;}
    try{
      const body=await readFileSync(file);
      const type=file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.webmanifest')?'application/manifest+json':file.endsWith('.png')?'image/png':file.endsWith('.glb')?'model/gltf-binary':file.endsWith('.wav')?'audio/wav':file.endsWith('.mp3')?'audio/mpeg':'application/octet-stream';
      response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'}).end(body);
    }catch{response.writeHead(404).end();}
  });
  return {server,legacy,godot,oldFixture,newFixture,setGodot:()=>{active=godot;}};
}

test('immutable legacy release waits in two windows, then the complete Godot release plays offline',async({browser,browserName})=>{
  test.skip(browserName==='webkit','Chromium exercises the cross-release worker lifecycle; installed Safari acceptance remains a device check.');
  test.setTimeout(240_000);
  const fixture=staticServer();await new Promise<void>(resolveListen=>fixture.server.listen(0,'127.0.0.1',resolveListen));
  const address=fixture.server.address();if(!address||typeof address==='string')throw new Error('No fixture server address');
  const origin=`http://127.0.0.1:${address.port}`,context=await browser.newContext({viewport:{width:844,height:390},serviceWorkers:'allow'});
  try{
    const first=await context.newPage();
    await first.addInitScript(()=>{
      localStorage.setItem('sor.settings.v1',JSON.stringify({schemaVersion:1,musicVolume:0.4,effectsVolume:0.6,screenShake:false}));
      localStorage.setItem('streets-of-rock.best.v1',JSON.stringify({schemaVersion:1,bestSuccessfulMs:43210}));
      localStorage.setItem('streets-of-rock.tutorial.v1',JSON.stringify({schemaVersion:1,completed:['movement','attack']}));
    });
    const second=await context.newPage();
    await first.goto(origin);await second.goto(origin);
    await expect(first.getByRole('heading',{name:'Choose Your Chieftain'})).toBeVisible({timeout:60000});
    await expect(second.getByRole('heading',{name:'Choose Your Chieftain'})).toBeVisible({timeout:60000});
    await expect(first.getByText('Offline ready')).toBeVisible({timeout:60000});
    await expect(second.getByText('Offline ready')).toBeVisible({timeout:60000});
    await first.reload();await second.reload();
    expect(await first.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
    expect(await second.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
    await chooseDuo(first,'Cow','Crow');
    await expect(first.getByRole('button',{name:'Pause'})).toBeVisible();
    fixture.setGodot();
    await first.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration())?.update();});
    await expect.poll(()=>first.evaluate(async()=>{
      const registration=await navigator.serviceWorker.getRegistration();
      return registration?.waiting?'waiting':registration?.installing?.state??'none';
    }),{timeout:180000}).toBe('waiting');
    await expect(first.getByRole('button',{name:'Pause'})).toBeVisible();
    await expect(second.getByRole('heading',{name:'Choose Your Chieftain'})).toBeVisible();
    await second.evaluate(()=>{
      (window as any).__upgradePhases=[];
      new MutationObserver(records=>{
        for(const record of records)for(const node of record.addedNodes)if(node instanceof Element){
          for(const [phase,selector] of [['preparing','.preparation'],['countdown','.countdown-number']]){
            if(node.matches(selector!)||node.querySelector(selector!))(window as any).__upgradePhases.push(phase);
          }
        }
      }).observe(document.body,{childList:true,subtree:true});
    });
    await chooseDuo(second,'Lion','Plates');
    await expect(second.locator('.countdown-number')).toBeVisible();
    expect(await second.evaluate(()=>(window as any).__upgradePhases)).toEqual(expect.arrayContaining(['preparing','countdown']));
    expect(await second.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(true);
    expect(await second.locator('#semantics [data-control-id="character-cow"]').count()).toBe(0);
    await expect(second.getByRole('button',{name:'Pause'})).toBeVisible({timeout:10000});
    await first.getByRole('button',{name:'Pause'}).click();await expect(first.getByRole('button',{name:'Resume'})).toBeVisible();
    await first.close();await second.close();

    const upgraded=await context.newPage();await upgraded.goto(origin);
    await expect.poll(()=>upgraded.evaluate(()=>(window as any).SorBoot?.buildId),{timeout:60000}).toBe(fixture.newFixture.buildId);
    await expect.poll(()=>upgraded.evaluate(()=>!!navigator.serviceWorker.controller),{timeout:60000}).toBe(true);
    await expect(upgraded.locator('#semantics [data-control-id="character-cow"]')).toHaveCount(1,{timeout:60000});
    const cache=await upgraded.evaluate((buildId)=>new Promise<any>((resolve,reject)=>{
      const worker=navigator.serviceWorker.controller;if(!worker){reject(new Error('No active release worker'));return;}
      const channel=new MessageChannel(),timeout=setTimeout(()=>reject(new Error('Cache audit timed out')),120000);
      channel.port1.onmessage=event=>{if(event.data?.type==='CACHE_STATUS'){clearTimeout(timeout);resolve(event.data);}};
      worker.postMessage({type:'CACHE_STATUS',protocolVersion:1,expectedBuildId:buildId,requestId:'immutable-upgrade-audit'},[channel.port2]);
    }),fixture.newFixture.buildId);
    expect(cache.state).toBe('ready');expect(cache.missing).toEqual([]);expect(cache.corrupt).toEqual([]);
    expect(await upgraded.evaluate(()=>JSON.parse(localStorage.getItem('sor.settings.v1')!).musicVolume)).toBe(0.4);
    expect(await upgraded.evaluate(()=>JSON.parse(localStorage.getItem('streets-of-rock.best.v1')!).bestSuccessfulMs)).toBe(43210);
    await context.setOffline(true);await upgraded.reload();
    await expect(upgraded.locator('#semantics [data-control-id="character-cow"]')).toHaveCount(1,{timeout:60000});
    await upgraded.getByRole('button',{name:'Settings'}).focus();await upgraded.keyboard.press('Enter');
    await expect(upgraded.getByRole('slider',{name:'Music volume'})).toHaveValue('0.4');
    await expect(upgraded.getByRole('slider',{name:'Effects volume'})).toHaveValue('0.6');
    await upgraded.getByRole('button',{name:'Close settings'}).focus();await upgraded.keyboard.press('Enter');
    for(const name of ['Cow','Cow','Crow','Crow']){await upgraded.getByRole('button',{name,exact:true}).focus();await upgraded.keyboard.press('Enter');}
    await expect(upgraded.getByRole('button',{name:'Light'})).toBeVisible({timeout:60000});
  }finally{
    await context.close();await new Promise<void>((resolveClose,reject)=>fixture.server.close(error=>error?reject(error):resolveClose()));
  }
});
