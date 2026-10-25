export const speechAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text, lang = 'en', enabled = true) {
  if (!enabled || !speechAvailable() || !text) return false;
  const engine = window.speechSynthesis;
  const voices = engine.getVoices() || [];
  let voice = null;
  if (voices.length > 0) {
    voice =
      voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase())) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];
  }
  engine.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  utterance.rate = 0.9;
  engine.speak(utterance);
  return true;
}

export function stopSpeech() {
  if (speechAvailable()) window.speechSynthesis.cancel();
}
