import * as tf from '@tensorflow/tfjs';
import {classIds} from '../data/vocabulary.js';
export class Recognizer{
  constructor(){this.model=null;this.status='setup';this.labels=[];this.lastTime=0;this.candidate=null;this.streak=0;this.cooldownUntil=0;this.released=true;this.threshold=.85;}
  async load(){try{
    const response=await fetch('/models/sign_classifier/labels.json',{cache:'no-store'});
    if(!response.ok)throw Error('Vocabulary mapping is missing');
    const labels=await response.json();if(!Array.isArray(labels)||labels.length<2||labels.some(x=>!classIds.includes(x))||labels[0]!=='idle'||new Set(labels).size!==labels.length)throw Error('Invalid class vocabulary');
    this.model=await tf.loadLayersModel('/models/sign_classifier/model.json');
    const shape=this.model.inputs[0].shape,output=this.model.outputs[0].shape;
    if(shape.length!==3||shape[1]!==30||shape[2]!==132||output.at(-1)!==labels.length)throw Error('Incompatible model dimensions');
    this.labels=labels;this.status='ready';return true;
  }catch(e){this.status='setup';this.error=e.message;this.model?.dispose();this.model=null;return false;}}
  async predict(sequence,now=performance.now()){
    if(!this.model||!sequence||sequence.length!==30||sequence.some(f=>f.length!==132||f.some(v=>!Number.isFinite(v))))return {state:'unavailable'};
    if(now<this.cooldownUntil)return {state:'cooldown'};
    if(now-this.lastTime<160)return {state:'waiting'};
    this.lastTime=now;
    const probabilities=tf.tidy(()=>{const input=tf.tensor3d([sequence],[1,30,132]);const result=this.model.predict(input);if(Array.isArray(result))throw Error('Multiple outputs not supported');return Array.from(result.dataSync());});
    const idx=probabilities.indexOf(Math.max(...probabilities));const label=this.labels[idx];const score=probabilities[idx];
    if(label==='idle'){this.released=true;this.candidate=null;this.streak=0;return {state:'idle'};}
    if(!this.released)return {state:'release_required'};
    if(score<this.threshold){this.candidate=null;this.streak=0;return {state:'uncertain',score};}
    this.streak=this.candidate===label?this.streak+1:1;this.candidate=label;
    if(this.streak<3)return {state:'recognizing'};
    this.released=false;this.cooldownUntil=now+1800;this.streak=0;return {state:'candidate',label,score};
  }
  reset(){this.released=true;this.candidate=null;this.streak=0;this.cooldownUntil=0;}
  dispose(){this.model?.dispose();this.model=null;}
}
