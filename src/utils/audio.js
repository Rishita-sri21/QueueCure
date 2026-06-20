/**
 * Premium native chime synthesizer using Web Audio API to bypass CORS restrictions.
 */
export const playChime = (soundEnabled) => {
  if (!soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Ambient G5 Chime (High Pitch Sweet Tone)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 783.99; 
    osc1.type = 'sine';
    
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    // Warm C6 Resolution
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1046.50; 
    osc2.type = 'sine';
    
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.7);
  } catch (e) {
    console.warn("Synthesizer context blocked by system: ", e);
  }
};


/**
 * Natural voice announcement engine using Speech Synthesis API.
 * Vocally summons patients to Cabin 1 in a clear, friendly tone.
 */
export const announcePatientCall = (soundEnabled, token, name) => {
  if (!soundEnabled) return;
  try {
    if ('speechSynthesis' in window) {
      // Clean up previous utterances
      window.speechSynthesis.cancel();
      
      const announcement = new SpeechSynthesisUtterance();
      announcement.text = `Token number ${token}, ${name}, please proceed to the doctor's cabin.`;
      announcement.rate = 0.95; 
      announcement.pitch = 1.05; 
      
      // Select natural English voice if available on user device
      const voices = window.speechSynthesis.getVoices();
      const voiceOption = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural')) && v.lang.startsWith('en')
      );
      if (voiceOption) {
        announcement.voice = voiceOption;
      }
      
      window.speechSynthesis.speak(announcement);
    }
  } catch (e) {
    console.warn("Vocal announcer blocked by browser interaction guidelines: ", e);
  }
};