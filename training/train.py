"""Train a temporal classifier with held-out signers. No fabricated data or accuracy."""
import argparse,json
from pathlib import Path
import numpy as np
from pipeline import load_files

def main():
    parser=argparse.ArgumentParser();parser.add_argument('dataset');parser.add_argument('--out',default='output');parser.add_argument('--epochs',type=int,default=35);args=parser.parse_args()
    from sklearn.model_selection import GroupShuffleSplit
    from sklearn.metrics import classification_report, confusion_matrix
    import tensorflow as tf
    samples=load_files(args.dataset)
    labels=['idle']+sorted({s['label'] for s in samples if s['label']!='idle'})
    if 'idle' not in {s['label'] for s in samples}:raise SystemExit('Training requires genuine idle/no-sign recordings')
    if len(set(s['signerId'] for s in samples))<3:raise SystemExit('At least 3 distinct signers are required for this example held-out-signer split; more strongly recommended')
    x=np.stack([s['sequence'] for s in samples]);y=np.array([labels.index(s['label']) for s in samples]);groups=np.array([s['signerId'] for s in samples]);
    train_idx,test_idx=next(GroupShuffleSplit(n_splits=1,test_size=.25,random_state=42).split(x,y,groups))
    if set(y[train_idx])!=set(range(len(labels))) or set(y[test_idx])!=set(range(len(labels))):raise SystemExit('Every class must be represented on both signer-disjoint partitions; collect more signers')
    model=tf.keras.Sequential([tf.keras.Input(shape=(30,132)),tf.keras.layers.Conv1D(48,5,activation='relu'),tf.keras.layers.MaxPooling1D(2),tf.keras.layers.Conv1D(64,3,activation='relu'),tf.keras.layers.GlobalAveragePooling1D(),tf.keras.layers.Dense(48,activation='relu'),tf.keras.layers.Dropout(.25),tf.keras.layers.Dense(len(labels),activation='softmax')]);model.compile(optimizer='adam',loss='sparse_categorical_crossentropy',metrics=['accuracy'])
    model.fit(x[train_idx],y[train_idx],epochs=args.epochs,validation_data=(x[test_idx],y[test_idx]),batch_size=16,verbose=2)
    probs=model.predict(x[test_idx]);pred=probs.argmax(axis=1)
    out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    report=classification_report(y[test_idx],pred,labels=list(range(len(labels))),target_names=labels,zero_division=0,output_dict=True)
    (out/'evaluation.json').write_text(json.dumps({'labels':labels,'heldOutSignerIds':sorted(set(groups[test_idx])),'classificationReport':report,'confusionMatrix':confusion_matrix(y[test_idx],pred,labels=list(range(len(labels)))).tolist()},indent=2))
    (out/'labels.json').write_text(json.dumps(labels,indent=2))
    model.save(out/'classifier.keras');print(f'Evaluation and model saved to {out}')
    print('Note: Separate test signers, idle false-activation evaluation and on-device latency must be assessed before clinical demonstration.')
if __name__=='__main__':main()
