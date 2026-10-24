# Dataset and model training

This is a **training pipeline, not a pretrained recognizer**. Start by obtaining permission and collecting verified signs from multiple consenting ISL users and an appropriate ISL reviewer. Include real idle/no-sign clips. Do not infer correctness from the label chosen in the recorder.

1. Export recorder JSON and place one or more exports in `training/datasets/` (not tracked in source control).
2. Install Python 3.10–3.12 in a virtual environment and run `pip install -r training/requirements.txt`. TensorFlow compatibility varies by OS/Python; test in your environment.
3. `cd training && python train.py datasets --out output`.
4. Review `output/evaluation.json`; ensure signer-disjoint splits, sufficient samples per class, per-class scores, and false activations during idle movement on unseen users are independently assessed.
5. `python evaluate.py independent-test-set --model output/classifier.keras --labels output/labels.json` for an independently collected test set.
6. Convert with a compatible `tensorflowjs_converter --input_format=keras output/classifier.keras ../public/models/sign_classifier` (some versions require saving an `.h5` model first, using `model.save('classifier.h5')`). Copy `output/labels.json` into the same model directory. Confirm the converted model loads in the actual browser; verify the converter with a dummy Conv1D model early.

Model input: `[batch,30,132]`; softmax output: `[batch,nClasses]`; class indices from `labels.json` with **idle at index 0**. In the app, features consist of two handedness slots, each with 21 wrist-centered XYZ landmarks scaled by wrist-to-middle-MCP distance (63), optional shoulder-relative wrist XY (2), presence (1). Front-camera video is mirrored **for display only**. Each inference sequence is resampled by timestamp to 30 frames over 1500 ms. Keep recording, training and inference processing aligned. Do not casually mirror samples; this could change signed meaning.

IMPORTANT: This sample training script uses a signer-disjoint held-out validation set during training; for trustworthy generalization claims, separately evaluate on completely unseen signer(s) not used to tune hyperparameters. The app threshold of 0.85 is an uncalibrated heuristic, **not verified accuracy**. Measure accuracy, per-class errors, idle false activation rate, latency and external-validity before publicly claiming performance.
