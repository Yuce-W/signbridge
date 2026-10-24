import React,{useState,useRef,useEffect,useCallback} from 'react';
import {openCamera,closeCamera} from '../services/camera.js';
import {initializeLandmarks} from '../services/landmarks.js';
import {extractFeatures} from '../services/features.js';
export default function CameraView({onFrame=()=>{},onStop=()=>{},compact=false}){
  const video=useRef(null),canvas=useRef(null),stream=useRef(null),detectors=useRef(null),raf=useRef(0),lastVideoTime=useRef(-1),lastPoseTime=useRef(0),pose=useRef([]),alive=useRef(true),frameCallback=useRef(onFrame);
  const [status,setStatus]=useState('off'),[error,setError]=useState(''),[drawPose,setDrawPose]=useState(false);
  frameCallback.current=onFrame;
  const stop=useCallback(()=>{cancelAnimationFrame(raf.current);closeCamera(stream.current);stream.current=null;detectors.current?.close();detectors.current=null;if(video.current)video.current.srcObject=null;const ctx=canvas.current?.getContext('2d');if(ctx)ctx.clearRect(0,0,canvas.current.width,canvas.current.height);setStatus('off');onStop();},[onStop]);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;cancelAnimationFrame(raf.current);closeCamera(stream.current);detectors.current?.close();};},[]);
  const loop=useCallback(()=>{
    const v=video.current,c=canvas.current,d=detectors.current;
    if(!v||!c||!d||!stream.current)return;
    if(v.readyState>=2&&v.currentTime!==lastVideoTime.current){
      lastVideoTime.current=v.currentTime;const t=performance.now();c.width=v.videoWidth;c.height=v.videoHeight;
      try{
        const result=d.hand.detectForVideo(v,t);
        if(d.pose&&t-lastPoseTime.current>120){pose.current=d.pose.detectForVideo(v,t).landmarks||[];lastPoseTime.current=t;}
        const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
        const renderPoints=(landmarks,color,size)=>landmarks.forEach(points=>points.forEach(p=>{ctx.beginPath();ctx.arc(p.x*c.width,p.y*c.height,size,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}));
        renderPoints(result.landmarks||[],'#b8fff1',4);if(drawPose)renderPoints(pose.current,'#ffec96',2);
        const features=extractFeatures(result.landmarks,result.handedness,pose.current);
        frameCallback.current({timestamp:t,features,hands:result.landmarks?.length||0});
      }catch(e){setError('Landmark detection failed: '+e.message);}
    }
    raf.current=requestAnimationFrame(loop);
  },[drawPose]);
  const start=async()=>{
    if(stream.current||status==='starting')return;
    setStatus('starting');setError('');
    try{
      const s=await openCamera();if(!alive.current){closeCamera(s);return;}stream.current=s;
      if(video.current){video.current.srcObject=s;await video.current.play();}
      setStatus('initializing');const d=await initializeLandmarks();
      if(!alive.current||stream.current!==s){d.close();closeCamera(s);return;}
      detectors.current=d;setStatus('active');lastVideoTime.current=-1;raf.current=requestAnimationFrame(loop);
    }catch(e){closeCamera(stream.current);stream.current=null;setStatus('error');setError(e.name==='NotAllowedError'?'Camera permission denied. Check your browser permissions.':e.message);}
  };
  return <section className={'camera-box'+(compact?' compact':'')} aria-label="Live camera and hand landmark detection">
    <div className="video-area"><video ref={video} playsInline muted aria-label="Camera preview"/><canvas ref={canvas} className="overlay" aria-hidden="true"/>{status!=='active'&&<div className="camera-placeholder"><span className="camera-mark">◎</span><strong>{status==='starting'?'Requesting camera access':status==='initializing'?'Initializing hand tracking':'Your camera preview appears here'}</strong><span>All camera frames stay in your browser.</span></div>}<span className="camera-chip">{status==='active'?'● CAMERA ON':status==='initializing'?'● LOADING':'○ CAMERA OFF'}</span></div>
    <div className="camera-toolbar"><div className="button-row"><button className="primary" onClick={start} disabled={status==='active'||status==='starting'||status==='initializing'}>Start camera</button><button className="secondary" onClick={stop} disabled={!stream.current}>Stop camera</button></div><label className="small-check"><input type="checkbox" checked={drawPose} onChange={e=>setDrawPose(e.target.checked)}/> Show body points</label></div>
    {error&&<p className="error" role="alert">{error}</p>}<p className="hint" role="status">{status==='active'?'Hand tracking is active. Keep both hands visible and well-lit.':'Camera access is requested only when you select Start camera.'}</p>
  </section>;
}
