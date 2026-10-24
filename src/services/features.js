export const FEATURE_DIM=132;
const valid=n=>typeof n==='number'&&Number.isFinite(n);
const finite=n=>valid(n)?n:0;
// Slots use MediaPipe handedness labels, not horizontal sorting. Training/live must use identical conventions.
export function extractFeatures(hands=[],handedness=[],pose=[]){
  const output=new Array(FEATURE_DIM).fill(0);
  const shoulders=pose?.[0] && pose?.[0]?.[11] && pose?.[0]?.[12] ? [pose[0][11],pose[0][12]]:null;
  const slots=[null,null];
  hands.forEach((hand,i)=>{
    const label=handedness?.[i]?.[0]?.categoryName?.toLowerCase();
    const target=label==='left'?0:label==='right'?1:-1;
    if(target!==-1 && !slots[target]) slots[target]=hand;
  });
  // Unlabelled hands receive unused slots; avoiding x-coordinate reassignment.
  hands.forEach(hand=>{if(!slots.includes(hand)){const slot=slots.findIndex(v=>!v);if(slot>=0)slots[slot]=hand;}});
  slots.forEach((hand,slot)=>{
    if(!Array.isArray(hand)||hand.length!==21||hand.some(p=>![p?.x,p?.y,p?.z].every(valid)))return;
    const offset=slot*66, wrist=hand[0];
    const scale=Math.hypot(hand[9].x-wrist.x,hand[9].y-wrist.y,hand[9].z-wrist.z);
    if(!valid(scale)||scale<1e-6)return;
    hand.forEach((p,i)=>{output[offset+i*3]=finite((p.x-wrist.x)/scale);output[offset+i*3+1]=finite((p.y-wrist.y)/scale);output[offset+i*3+2]=finite((p.z-wrist.z)/scale);});
    if(shoulders){const [l,r]=shoulders;const centerX=(l.x+r.x)/2,centerY=(l.y+r.y)/2;const width=Math.hypot(l.x-r.x,l.y-r.y);if(width>1e-6){output[offset+63]=finite((wrist.x-centerX)/width);output[offset+64]=finite((wrist.y-centerY)/width);}}
    output[offset+65]=1;
  });
  return output;
}
export function hasHands(vector){return vector?.[65]===1||vector?.[131]===1;}
