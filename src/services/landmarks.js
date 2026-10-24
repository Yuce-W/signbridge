import {FilesetResolver,HandLandmarker,PoseLandmarker} from '@mediapipe/tasks-vision';
const WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm';
export async function initializeLandmarks(){
  const vision=await FilesetResolver.forVisionTasks(WASM);
  const hand=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',delegate:'CPU'},runningMode:'VIDEO',numHands:2});
  let pose=null;
  try{pose=await PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:'CPU'},runningMode:'VIDEO',numPoses:1});}catch{ /* optional pose model */ }
  return {hand,pose,close(){hand.close();pose?.close();}};
}
