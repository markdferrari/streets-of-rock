const continuous=new Set(['x','depth','anchorX','anchorDepth','anchorHeight','halfHeight','aspect','minX','maxX','minY','maxY','minDepth','maxDepth','timestampMs','elapsedMs','discardedMs','accumulatedMs','remainingDistance','speedPerSecond']);
export function compare(expected:unknown, actual:unknown, path='$'):string[] {
 const a=expected??null,b=actual??null;
 if(typeof a==='number'&&typeof b==='number') {
  const key=path.split('.').at(-1)!;
  const valid=Number.isFinite(a)&&Number.isFinite(b)&&(continuous.has(key)?Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)):a===b);
  return valid?[]:[`${path}: expected ${a}, actual ${b}`];
 }
 if(Array.isArray(a)||Array.isArray(b)) {
  if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return [`${path}: array length/type differs`];
  return a.flatMap((value,i)=>compare(value,b[i],`${path}[${i}]`));
 }
 if(a&&b&&typeof a==='object'&&typeof b==='object') {
  const aa=a as Record<string,unknown>,bb=b as Record<string,unknown>;
  return [...new Set([...Object.keys(aa),...Object.keys(bb)])].sort().flatMap(key=>compare(aa[key],bb[key],`${path}.${key}`));
 }
 return a===b?[]:[`${path}: expected ${JSON.stringify(a)}, actual ${JSON.stringify(b)}`];
}
function record(x:unknown):x is Record<string,any> {return !!x&&typeof x==='object'&&!Array.isArray(x);}
export function validateReplay(value:unknown):string[] {
 const errors:string[]=[];
 if(!record(value))return ['replay must be an object'];
 if(value.schemaVersion!==1)errors.push('schemaVersion must be 1');
 if(!/^[a-f0-9]{40}$/.test(value.referenceCommit??''))errors.push('referenceCommit required');
 if(!/^[a-f0-9]{64}$/.test(value.contentDigest??''))errors.push('contentDigest required');
 if(typeof value.scenarioId!=='string'||!value.scenarioId)errors.push('scenarioId required');
 if(!Array.isArray(value.requirements)||!value.requirements.length)errors.push('requirements required');
 if(!record(value.startingRun))errors.push('startingRun required');
 if(!Array.isArray(value.frames)||!value.frames.length)return [...errors,'frames required'];
 let last=-Infinity;
 value.frames.forEach((frame:unknown,index:number)=>{
  const path=`frames[${index}]`;
  if(!record(frame)){errors.push(`${path}: object required`);return;}
  if(!Number.isFinite(frame.timestampMs)||frame.timestampMs<last)errors.push(`${path}.timestampMs: ordered finite timestamp required`);
  last=frame.timestampMs;
  if(typeof frame.running!=='boolean')errors.push(`${path}.running required`);
  if(!record(frame.viewport)||![frame.viewport.width,frame.viewport.height].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0))errors.push(`${path}.viewport invalid`);
  if(!record(frame.input)||!record(frame.input.move)||![frame.input.move.x,frame.input.move.depth].every(Number.isFinite))errors.push(`${path}.input invalid`);
  if(!record(frame.arena)||!Array.isArray(frame.arena.legalRegions)||!Array.isArray(frame.arena.visibleRegions)||!record(frame.arena.frame)||!record(frame.arena.body))errors.push(`${path}.arena invalid`);
  if(!Array.isArray(frame.events))errors.push(`${path}.events required`);
  if(!record(frame.state))errors.push(`${path}.state required`);
 });return errors;
}
