// Tiny kitchen sounds from the Web Audio oscillator: no audio files, no
// network. A short blip per action, each with its own pitch and shape, so a
// pickup sounds nothing like a serve.
export function createSounds() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  function tone(freq, seconds, type, gainValue, when = 0) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    const start = audio.currentTime + when;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.05);
  }

  return {
    play(name) {
      switch (name) {
        case 'pick':
          tone(660, 0.08, 'sine', 0.12);
          break;
        case 'sizzle':
          tone(220, 0.25, 'sawtooth', 0.05);
          tone(330, 0.2, 'sawtooth', 0.04, 0.05);
          break;
        case 'chop':
          tone(180, 0.07, 'square', 0.1);
          tone(180, 0.07, 'square', 0.1, 0.12);
          break;
        case 'pour':
          tone(440, 0.12, 'sine', 0.1);
          tone(330, 0.14, 'sine', 0.1, 0.08);
          break;
        case 'plate':
          tone(520, 0.1, 'triangle', 0.12);
          break;
        case 'serve':
          tone(523, 0.12, 'triangle', 0.14);
          tone(659, 0.12, 'triangle', 0.14, 0.1);
          tone(784, 0.2, 'triangle', 0.14, 0.2);
          break;
        case 'error':
          tone(160, 0.18, 'square', 0.08);
          break;
        case 'start':
          tone(392, 0.1, 'triangle', 0.12);
          tone(523, 0.16, 'triangle', 0.12, 0.09);
          break;
        default:
          break;
      }
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
  };
}
