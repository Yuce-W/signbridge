"""Run signer-labelled evaluation of a saved Keras model on an independent dataset."""
import argparse,json
from pathlib import Path
import numpy as np
from pipeline import load_files

def main():
    p=argparse.ArgumentParser();p.add_argument('dataset');p.add_argument('--model',required=True);p.add_argument('--labels',required=True);args=p.parse_args()
    from tensorflow import keras
    from sklearn.metrics import classification_report,confusion_matrix
    records=load_files(args.dataset);labels=json.loads(Path(args.labels).read_text());model=keras.models.load_model(args.model)
    if any(r['label'] not in labels for r in records):raise SystemExit('Unknown label in evaluation data')
    xs=np.stack([r['sequence'] for r in records]);ys=[labels.index(r['label']) for r in records]
    pred=model.predict(xs).argmax(axis=1)
    print('Evaluated signers:',sorted({r['signerId'] for r in records}));print(classification_report(ys,pred,labels=list(range(len(labels))),target_names=labels,zero_division=0));print(confusion_matrix(ys,pred,labels=list(range(len(labels))));print('Independently verify these signers were not used for training.')
if __name__=='__main__':main()
