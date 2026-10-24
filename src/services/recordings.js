import {FEATURE_DIM} from './features.js';
import {vocabulary} from '../data/vocabulary.js';
export const SCHEMA_VERSION=1;
export function validateRecording(r){
  if(!r||r.schemaVersion!==SCHEMA_VERSION||typeof r.signerId!=='string'||!/^[-_a-zA-Z0-9]{2,50}$/.test(r.signerId)||!(r.label==='idle'||vocabulary.some(v=>v.id===r.label))||r.consentConfirmed!==true||!Array.isArray(r.frames)||r.frames.length<2||!Number.isFinite(Date.parse(r.recordedAt)))return false;
  return r.frames.every((f,i)=>Number.isFinite(f.timestamp)&&f.timestamp>=0&&(i===0||f.timestamp>r.frames[i-1].timestamp)&&Array.isArray(f.features)&&f.features.length===FEATURE_DIM&&f.features.every(Number.isFinite));
}
export function downloadJson(data,filename){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
