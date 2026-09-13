/**
 * Tiny Web Audio beep engine for Mothership.
 * Mute persists in localStorage.
 */
(function (global) {
  const STORAGE_KEY = 'mothership_muted';

  let ctx = null;
  let muted = localStorage.getItem(STORAGE_KEY) === '1';

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain) {
    if (muted) return;
    const c = ensureCtx();
    if (!c) return;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(gain == null ? 0.08 : gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  const SFX = {
    beam() {
      tone(220, 0.08, 'sawtooth', 0.06);
      setTimeout(() => tone(330, 0.12, 'sawtooth', 0.05), 40);
      setTimeout(() => tone(440, 0.18, 'triangle', 0.04), 90);
    },
    score() {
      tone(520, 0.07, 'square', 0.07);
      setTimeout(() => tone(780, 0.1, 'square', 0.06), 60);
    },
    hit() {
      tone(90, 0.2, 'sawtooth', 0.1);
      setTimeout(() => tone(60, 0.25, 'square', 0.08), 80);
    },
    power() {
      tone(300, 0.06, 'triangle', 0.07);
      setTimeout(() => tone(450, 0.06, 'triangle', 0.07), 50);
      setTimeout(() => tone(600, 0.12, 'triangle', 0.08), 100);
    },
    ui() {
      tone(400, 0.05, 'square', 0.05);
    },
    gameOver() {
      tone(200, 0.15, 'sawtooth', 0.08);
      setTimeout(() => tone(150, 0.2, 'sawtooth', 0.07), 120);
      setTimeout(() => tone(100, 0.35, 'triangle', 0.06), 260);
    },
    landing() {
      tone(180, 0.1, 'triangle', 0.06);
      setTimeout(() => tone(240, 0.12, 'triangle', 0.05), 80);
      setTimeout(() => tone(120, 0.25, 'sawtooth', 0.04), 180);
    },
  };

  global.MothershipAudio = {
    play(name) {
      const fn = SFX[name];
      if (fn) fn();
    },
    isMuted() {
      return muted;
    },
    setMuted(v) {
      muted = !!v;
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    },
    toggle() {
      this.setMuted(!muted);
      return muted;
    },
    unlock() {
      ensureCtx();
    },
  };
})(window);
