import React, { useState, useRef, useEffect, useCallback } from 'react';
import { openCamera, closeCamera } from '../services/camera.js';
import { initializeLandmarks } from '../services/landmarks.js';
import { extractFeatures } from '../services/features.js';

const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17]
];

export default function CameraView({ onFrame = () => {}, onStop = () => {}, compact = false }) {
  const video = useRef(null);
  const canvas = useRef(null);
  const stream = useRef(null);
  const detectors = useRef(null);
  const raf = useRef(0);
  const lastVideoTime = useRef(-1);
  const lastPoseTime = useRef(0);
  const pose = useRef([]);
  const alive = useRef(true);
  const frameCallback = useRef(onFrame);

  const [status, setStatus] = useState('off');
  const [error, setError] = useState('');
  const [drawPose, setDrawPose] = useState(false);

  frameCallback.current = onFrame;

  const stop = useCallback(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
    if (stream.current) {
      closeCamera(stream.current);
      stream.current = null;
    }
    if (detectors.current) {
      detectors.current.close();
      detectors.current = null;
    }
    if (video.current) {
      video.current.srcObject = null;
    }
    const ctx = canvas.current?.getContext('2d');
    if (ctx && canvas.current) {
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
    setStatus('off');
    onStop();
  }, [onStop]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (raf.current) cancelAnimationFrame(raf.current);
      closeCamera(stream.current);
      detectors.current?.close();
    };
  }, []);

  const loop = useCallback(() => {
    const v = video.current;
    const c = canvas.current;
    const d = detectors.current;

    if (!v || !c || !d || !stream.current) return;

    if (v.readyState >= 2 && v.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = v.currentTime;
      const t = performance.now();

      if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
        c.width = v.videoWidth || 640;
        c.height = v.videoHeight || 480;
      }

      try {
        const result = d.hand.detectForVideo(v, t);

        if (d.pose && t - lastPoseTime.current > 150) {
          try {
            const pRes = d.pose.detectForVideo(v, t);
            pose.current = pRes?.landmarks || [];
            lastPoseTime.current = t;
          } catch (e) {
            // ignore pose errors
          }
        }

        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);

        // Render Hand Skeletons
        const hands = result.landmarks || [];
        hands.forEach((handPoints, hIdx) => {
          const isLeft = result.handedness?.[hIdx]?.[0]?.categoryName === 'Left';
          const boneColor = isLeft ? 'rgba(34, 211, 238, 0.85)' : 'rgba(18, 111, 101, 0.85)';
          const jointColor = isLeft ? '#22D3EE' : '#14B8A6';

          // 1. Draw bones
          HAND_CONNECTIONS.forEach(([i, j]) => {
            const p1 = handPoints[i];
            const p2 = handPoints[j];
            if (p1 && p2) {
              ctx.beginPath();
              ctx.moveTo(p1.x * c.width, p1.y * c.height);
              ctx.lineTo(p2.x * c.width, p2.y * c.height);
              ctx.strokeStyle = boneColor;
              ctx.lineWidth = 3;
              ctx.stroke();
            }
          });

          // 2. Draw joints
          handPoints.forEach((p, pIdx) => {
            ctx.beginPath();
            ctx.arc(p.x * c.width, p.y * c.height, pIdx === 0 ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = pIdx === 0 ? '#F43F5E' : jointColor;
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });
        });

        // Optional Pose Shoulders
        if (drawPose && pose.current?.[0]) {
          const lShoulder = pose.current[0][11];
          const rShoulder = pose.current[0][12];
          if (lShoulder && rShoulder) {
            ctx.beginPath();
            ctx.moveTo(lShoulder.x * c.width, lShoulder.y * c.height);
            ctx.lineTo(rShoulder.x * c.width, rShoulder.y * c.height);
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
            ctx.lineWidth = 3;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            [lShoulder, rShoulder].forEach((p) => {
              ctx.beginPath();
              ctx.arc(p.x * c.width, p.y * c.height, 5, 0, Math.PI * 2);
              ctx.fillStyle = '#F59E0B';
              ctx.fill();
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            });
          }
        }

        const features = extractFeatures(result.landmarks, result.handedness, pose.current);
        frameCallback.current({ timestamp: t, features, hands: hands.length });
      } catch (e) {
        console.warn('Landmark detection loop error:', e);
      }
    }

    if (status === 'active' && alive.current) {
      raf.current = requestAnimationFrame(loop);
    }
  }, [drawPose, status]);

  const start = async () => {
    if (stream.current || status === 'starting' || status === 'initializing') return;
    setStatus('starting');
    setError('');

    try {
      const s = await openCamera();
      if (!alive.current) {
        closeCamera(s);
        return;
      }
      stream.current = s;

      if (video.current) {
        video.current.srcObject = s;
        await new Promise((resolve) => {
          video.current.onloadedmetadata = () => {
            video.current.play().then(resolve).catch(resolve);
          };
          if (video.current.readyState >= 1) {
            video.current.play().then(resolve).catch(resolve);
          }
        });
      }

      setStatus('initializing');
      const d = await initializeLandmarks();
      if (!alive.current || stream.current !== s) {
        d.close();
        closeCamera(s);
        return;
      }

      detectors.current = d;
      setStatus('active');
      lastVideoTime.current = -1;
      raf.current = requestAnimationFrame(loop);
    } catch (e) {
      console.error('Camera start error:', e);
      if (stream.current) {
        closeCamera(stream.current);
        stream.current = null;
      }
      setStatus('error');
      setError(
        e.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : e.message || 'Failed to start camera.'
      );
    }
  };

  useEffect(() => {
    if (status === 'active') {
      raf.current = requestAnimationFrame(loop);
    }
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [status, loop]);

  return (
    <section className={'camera-box' + (compact ? ' compact' : '')} aria-label="Live camera and hand landmark detection">
      <div className="video-area">
        <video ref={video} playsInline muted autoPlay aria-label="Camera preview" />
        <canvas ref={canvas} className="overlay" aria-hidden="true" />
        {status !== 'active' && (
          <div className="camera-placeholder">
            <span className="camera-mark">◎</span>
            <strong>
              {status === 'starting'
                ? 'Requesting camera access…'
                : status === 'initializing'
                ? 'Initializing hand tracking engine…'
                : 'Your camera preview appears here'}
            </strong>
            <span>All camera frames stay in your browser.</span>
          </div>
        )}
        <span className="camera-chip">
          {status === 'active' ? '● CAMERA ON' : status === 'initializing' ? '● INITIALIZING' : status === 'starting' ? '● STARTING' : '○ CAMERA OFF'}
        </span>
      </div>

      <div className="camera-toolbar">
        <div className="button-row">
          <button
            className="primary"
            onClick={start}
            disabled={status === 'active' || status === 'starting' || status === 'initializing'}
          >
            Start camera
          </button>
          <button className="secondary" onClick={stop} disabled={status === 'off'}>
            Stop camera
          </button>
        </div>
        <label className="small-check">
          <input type="checkbox" checked={drawPose} onChange={(e) => setDrawPose(e.target.checked)} /> Show body points
        </label>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      <p className="hint" role="status">
        {status === 'active'
          ? 'Hand tracking is active. Keep both hands visible and well-lit inside the frame.'
          : 'Camera access is requested only when you select Start camera.'}
      </p>
    </section>
  );
}
