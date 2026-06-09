/**
 * Tactical audio synthesizer using the Web Audio API.
 * Synthesizes sound effects inline to avoid loading external asset files.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playNotificationSound(type: "chat" | "card" | "project") {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === "chat") {
      // Chat alert: Quick high double-chirp
      // Chirp 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
      
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Chirp 2 (slightly delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const delay = 0.08;
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1000, now + delay);
      osc2.frequency.exponentialRampToValueAtTime(1500, now + delay + 0.08);
      
      gain2.gain.setValueAtTime(0.08, now + delay);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + delay);
      osc2.stop(now + delay + 0.08);

    } else if (type === "card") {
      // Card alert: Crisp, clean tactical click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

    } else if (type === "project") {
      // Project alert: Tri-tone ascending sequence
      const frequencies = [440, 554, 659];
      const noteDuration = 0.07;
      
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + index * noteDuration;
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.07, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    }
  } catch (error) {
    console.warn("Failed to synthesize notification sound:", error);
  }
}
