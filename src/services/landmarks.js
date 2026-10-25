import { FilesetResolver, HandLandmarker, PoseLandmarker } from '@mediapipe/tasks-vision';

const LOCAL_WASM = '/mediapipe/wasm';
const CDN_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm';

const LOCAL_HAND_MODEL = '/models/hand_landmarker.task';
const CDN_HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const LOCAL_POSE_MODEL = '/models/pose_landmarker_lite.task';
const CDN_POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export async function initializeLandmarks() {
  let vision;
  try {
    vision = await FilesetResolver.forVisionTasks(LOCAL_WASM);
  } catch (e) {
    console.warn('Local WASM failed, falling back to CDN:', e);
    vision = await FilesetResolver.forVisionTasks(CDN_WASM);
  }

  let hand;
  try {
    hand = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: LOCAL_HAND_MODEL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  } catch (gpuErr) {
    try {
      hand = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: LOCAL_HAND_MODEL, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    } catch (localErr) {
      console.warn('Local model failed, falling back to CDN model:', localErr);
      hand = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: CDN_HAND_MODEL, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    }
  }

  let pose = null;
  try {
    pose = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: LOCAL_POSE_MODEL, delegate: 'CPU' },
      runningMode: 'VIDEO',
      numPoses: 1
    });
  } catch (poseErr) {
    try {
      pose = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: CDN_POSE_MODEL, delegate: 'CPU' },
        runningMode: 'VIDEO',
        numPoses: 1
      });
    } catch {
      // Optional pose model
      pose = null;
    }
  }

  return {
    hand,
    pose,
    close() {
      try { hand?.close(); } catch (e) {}
      try { pose?.close(); } catch (e) {}
    }
  };
}
