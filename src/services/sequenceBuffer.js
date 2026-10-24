import {FEATURE_DIM} from './features.js';
export function resampleFrames(frames,count=30,duration=1500){
  if(!Array.isArray(frames)||frames.length<2)return null;
  if(frames.some(f=>!Number.isFinite(f.timestamp)||!Array.isArray(f.features)||f.features.length!==FEATURE_DIM||f.features.some(v=>!Number.isFinite(v))))return null;
  for(let i=1;i<frames.length;i++)if(frames[i].timestamp<=frames[i-1].timestamp)return null;
  const end=frames.at(-1).timestamp,start=end-duration;
  if(frames[0].timestamp>start+duration*.15)return null;
  return Array.from({length:count},(_,i)=>{
    const t=start+i*duration/(count-1);
    if(t<=frames[0].timestamp)return [...frames[0].features];
    let b=frames.findIndex(f=>f.timestamp>=t);if(b<0)return [...frames.at(-1).features];
    if(b===0)return [...frames[0].features];
    const a=b-1,alpha=(t-frames[a].timestamp)/(frames[b].timestamp-frames[a].timestamp);
    return frames[a].features.map((v,k)=>v*(1-alpha)+frames[b].features[k]*alpha);
  });
}
export class SequenceBuffer{
  constructor(duration=1500){this.duration=duration;this.frames=[];}
  push(timestamp,features){if(!Number.isFinite(timestamp)||features?.length!==FEATURE_DIM||features.some(v=>!Number.isFinite(v))||timestamp<=(this.frames.at(-1)?.timestamp??-Infinity))return false;this.frames.push({timestamp,features:[...features]});while(this.frames.length>2&&this.frames[1].timestamp<timestamp-this.duration)this.frames.shift();return true;}
  sample(){return resampleFrames(this.frames,30,this.duration);}
  clear(){this.frames=[];}
}
