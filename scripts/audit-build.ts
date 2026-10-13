import {existsSync} from 'node:fs';
import {auditBuild} from './build-asset-inventory';
import {auditFoundationBuild} from './godot/audit';
const args=process.argv.slice(2).filter(a=>a!=='--'),dir=args.find(a=>!a.startsWith('--'))??'dist',final=args.includes('--final');
if(existsSync(`${dir}/releases`)){
 const result=auditFoundationBuild(dir,final);console.log(`Web export audit passed: ${result.buildId}, ${(result.contentBytes/1024/1024).toFixed(2)} MiB content, ${(result.engineBytes/1024/1024).toFixed(2)} MiB verified engine; cached ${result.cachedBytes} bytes, gzip estimate ${result.gzipEstimateBytes} bytes, Brotli estimate ${result.brotliEstimateBytes} bytes.`);
}else{
 const result=auditBuild(dir,{requireFinalTrack:final});console.log(`Legacy build audit passed: ${result.files} assets, ${(result.bytes/1024/1024).toFixed(2)} MiB.`);
}
