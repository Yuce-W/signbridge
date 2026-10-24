# SignBridge

An accessible browser-based **limited-vocabulary** healthcare communication aid. Not a full ISL translator, interpreter, emergency service or medical decision aid.

## Run

```bash
npm install
npm run dev
npm test
npm run build
```

Use HTTPS or localhost for camera permissions. For Vercel, choose Vite static output directory `dist` and build command `npm run build`; route rewrites are defined in `vercel.json`.

## Current implementation

- Home, patient mode, staff catalogue, landmark dataset studio, settings, safety page.
- Webcam access and track cleanup; MediaPipe hand and optional pose detection; landmarks drawn over the camera. Remote MediaPipe model assets need network access.
- Deterministic 132-feature extraction, timestamp-resampled 30-frame windows and TF.js model loader with input/output validation.
- Confidence/repeat/cooldown/release safeguards, confirmation-before-speech, manual fallback, checked speech voice availability.
- Pseudonymous signer consent, timed recording, sample review, export/import and JSON validation.
- Staff catalog with honest unavailable-video states; searchable/filterable phrases.
- `training/` Python dataset loader, signer-disjoint training and evaluation scripts.

## Setup mode and required assets

There is **no pre-trained ISL model, validated dataset or signer video bundled**. Accordingly the patient page makes no AI predictions without a real exported classifier. Manual selection remains functional. Candidate labels in `src/data/vocabulary.js` are not independently validated ISL glosses. Staff phrase videos are currently marked unavailable and should never be represented as validated until reviewed and licensed. The sample catalogue is in `public/data/phrases.json`. When videos exist, add them to `public/signs/`, set the path, caption and validated status after review.

To enable model inference supply `public/models/sign_classifier/model.json`, its weights, and `labels.json` (array with `idle` first). `training/README.md` describes preprocessing, evaluation and conversion. Paths are absolute for root deployment.

## Recording schema

Each export is an array of objects: `{schemaVersion:1, signerId:string, label:string, consentConfirmed:true, recordedAt: ISO8601 string, frames:[{timestamp: milliseconds since start, features: 132 finite numbers},...]}`. Frames have monotonically increasing timestamps. Recordings remain in session RAM and download only when requested. They are still person-derived biometric/behavioral information; treat exports sensitively.

## Privacy, accessibility, limitations

Video stays in the browser and is not persisted or transmitted. The media models and fonts may be fetched from third-party servers while setting up; therefore **no offline capability is claimed**. Accessible labeled controls, keyboard focus, readable text, high contrast, text size and reduced motion are provided. Text content currently supports English; optional Hindi speech depends on installed voices. Ask for a qualified interpreter for informed consent, diagnosis, complex clinical matters or emergency situations.

## Testing

`npm test` checks feature vectors, timestamp processing and schema validation. `npm run build` verifies bundling. Manual checks on the actual camera-equipped demo device are still required: consent, denial, start/stop/unmount, mirrored overlay, one/two-hand tracking, idle detection, unknown signer, screen reader, keyboard and language voice support. Additional automated browser integration and classifier-gating tests are recommended before real use.

## 90-second demo

Explain limited scope → patient mode camera + live landmarks → **manual fallback (explicitly labeled)** → confirm and optionally speak → staff search and honest missing-video state → show training/evaluation procedure rather than invented metrics → summarize safety and privacy. Once authentic model/video assets are validated and installed, replace the fallback demonstrations with real supported examples.
