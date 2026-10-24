export async function openCamera(){if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera API unavailable. Use HTTPS or localhost.');return navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:960},height:{ideal:720}}});}
export function closeCamera(stream){stream?.getTracks().forEach(track=>track.stop());}
