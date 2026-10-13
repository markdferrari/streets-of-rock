import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {it,expect} from 'vitest';import {serveFile} from '../../scripts/preview';
it('serves correct engine MIME types, errors for missing assets and confines traversal',()=>{
 const root=mkdtempSync(join(tmpdir(),'sor-preview-'));try{
  writeFileSync(join(root,'index.html'),'shell');writeFileSync(join(root,'sor.wasm'),'wasm');writeFileSync(join(root,'sor.pck'),'pack');writeFileSync(join(root,'.gdignore'),'');
  expect(serveFile(root,'/sor.wasm').headers['Content-Type']).toBe('application/wasm');
  expect(serveFile(root,'/sor.pck').headers['Content-Type']).toBe('application/octet-stream');
  expect(serveFile(root,'/releases/id/missing.wasm').status).toBe(404);expect(serveFile(root,'/.gdignore').status).toBe(404);
  expect(serveFile(root,'/../outside').status).toBe(403);expect(serveFile(root,'/%2e%2e/outside').status).toBe(403);
  expect(serveFile(root,'/').body?.toString()).toBe('shell');
 }finally{rmSync(root,{recursive:true,force:true});}
});
