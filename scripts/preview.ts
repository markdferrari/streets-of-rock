import {createServer} from 'node:http';
import {existsSync,readFileSync,realpathSync,statSync} from 'node:fs';
import {extname,resolve,sep} from 'node:path';
const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.wasm':'application/wasm','.pck':'application/octet-stream','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg','.wav':'audio/wav'};
export function serveFile(root:string,url:string):{status:number;headers:Record<string,string>;body:Buffer|null} {
 let path:string;try{path=decodeURIComponent(url.split('?')[0]!);}catch{return {status:400,headers:{},body:null};}
 if(path.includes('\0')||path.includes('\\')||path.split('/').includes('..'))return {status:403,headers:{},body:null};
 if(path.split('/').some(segment=>segment.startsWith('.')))return {status:404,headers:{},body:null};
 const base=resolve(root),file=resolve(base,'.'+(path==='/'?'/index.html':path));
 if(!file.startsWith(base+sep))return {status:403,headers:{},body:null};
 if(!existsSync(file)||!statSync(file).isFile())return {status:404,headers:{'Content-Type':'text/plain'},body:Buffer.from('Required resource not found')};
 if(!realpathSync(file).startsWith(realpathSync(base)+sep))return {status:403,headers:{},body:null};
 return {status:200,headers:{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':path.startsWith('/releases/')?'public, max-age=31536000, immutable':'no-cache'},body:readFileSync(file)};
}
if(import.meta.main){
 const args=process.argv.slice(2).filter(a=>a!=='--');let dir='dist',host='127.0.0.1',port=4173;
 for(let i=0;i<args.length;i++){const value=args[++i];if(!value)throw new Error('Missing preview argument');if(args[i-1]==='--dir')dir=value;else if(args[i-1]==='--host')host=value;else if(args[i-1]==='--port')port=Number(value);else throw new Error('Unknown preview argument');}
 if(!Number.isSafeInteger(port)||port<1||port>65535)throw new Error('Invalid port');
 createServer((req,res)=>{const file=serveFile(dir,req.url??'/');res.writeHead(file.status,file.headers);res.end(file.body);}).listen(port,host,()=>console.log(`Serving ${dir} on http://${host}:${port}`));
}
