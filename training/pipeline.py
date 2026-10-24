"""Shared schema and time resampling contract for landmark datasets."""
import json
import numpy as np
from pathlib import Path
FEATURES=132; STEPS=30; DURATION_MS=1500

def resample(frames):
    times=np.array([f['timestamp'] for f in frames],dtype=float)
    values=np.asarray([f['features'] for f in frames],dtype=np.float32)
    if len(times)<2 or values.ndim!=2 or values.shape[1]!=FEATURES or not np.isfinite(values).all() or not np.isfinite(times).all() or np.any(np.diff(times)<=0):
        raise ValueError('Invalid timestamps or feature dimensions')
    end=times[-1]; start=end-DURATION_MS
    if times[0]>start+DURATION_MS*.15:raise ValueError('Insufficient duration')
    targets=np.linspace(start,end,STEPS)
    return np.stack([np.interp(targets,times,values[:,i]) for i in range(FEATURES)],axis=-1).astype('float32')

def load_files(folder):
    result=[]
    for file in sorted(Path(folder).glob('*.json')):
        data=json.loads(file.read_text(encoding='utf-8'))
        for r in data if isinstance(data,list) else [data]:
            if not isinstance(r,dict) or r.get('schemaVersion')!=1 or r.get('consentConfirmed') is not True or not isinstance(r.get('signerId'),str) or not isinstance(r.get('label'),str):
                raise ValueError(f'Invalid recording metadata: {file}')
            r['sequence']=resample(r.get('frames',[]))
            result.append(r)
    return result
