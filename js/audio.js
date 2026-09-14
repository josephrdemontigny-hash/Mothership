/**
 * Tiny Web Audio beep engine + theme music for Mothership.
 * Mute persists in localStorage. Theme starts on title-screen cassette insert
 * (must call playTheme inside the same user gesture for iOS/Safari);
 * keeps playing through shed + yard + fly + results; stops on title only.
 *
 * Critical iOS rules:
 *  - unlock() only resumes AudioContext (tiny silent beep OK).
 *  - NEVER play()/pause() the theme element to "prime" — that burns the gesture.
 *  - playTheme() calls el.play() synchronously in the calling stack.
 */
(function (global) {
  const STORAGE_KEY = 'mothership_muted';
  const THEME_SRC = 'assets/mothership-theme.mp3';

  let ctx = null;
  let muted = localStorage.getItem(STORAGE_KEY) === '1';
  let musicEl = null;
  let musicWanted = false;
  let musicUnlocked = false;
  let playRetryTimer = null;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') {
      try { ctx.resume(); } catch (_) { /* ignore */ }
    }
    return ctx;
  }

  function bindThemeElement(el) {
    if (!el) return null;
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0.55;
    el.playsInline = true;
    try { el.setAttribute('playsinline', ''); } catch (_) { /* ignore */ }
    try { el.setAttribute('webkit-playsinline', ''); } catch (_) { /* ignore */ }
    return el;
  }

  function ensureMusic() {
    if (!musicEl) {
      const existing = document.getElementById('theme-audio');
      if (existing) {
        musicEl = existing;
        if (!musicEl.getAttribute('src') && !musicEl.src) {
          musicEl.src = THEME_SRC;
        }
      } else {
        musicEl = new Audio(THEME_SRC);
      }
      bindThemeElement(musicEl);
      try { musicEl.load(); } catch (_) { /* ignore */ }
    }
    return musicEl;
  }

  function clearPlayRetry() {
    if (playRetryTimer != null) {
      clearTimeout(playRetryTimer);
      playRetryTimer = null;
    }
  }

  function tryPlayElement(el) {
    if (!el) return;
    let p;
    try {
      // Must stay synchronous in the caller's stack (iOS user-gesture).
      p = el.play();
    } catch (_) {
      schedulePlayRetry();
      return;
    }
    if (p && typeof p.then === 'function') {
      p.then(function () {
        clearPlayRetry();
      }).catch(function () {
        schedulePlayRetry();
      });
    }
  }

  function schedulePlayRetry() {
    if (!musicWanted || muted) return;
    if (playRetryTimer != null) return;
    playRetryTimer = setTimeout(function () {
      playRetryTimer = null;
      syncMusicPlayback();
    }, 280);
  }

  function syncMusicPlayback() {
    const el = ensureMusic();
    if (!el) return;
    if (muted || !musicWanted) {
      clearPlayRetry();
      try { el.pause(); } catch (_) { /* ignore */ }
      return;
    }
    tryPlayElement(el);
  }

  function silentWarmBeep(c) {
    if (!c) return;
    try {
      const t0 = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(40, t0);
      g.gain.setValueAtTime(0.00008, t0);
      o.connect(g);
      g.connect(c.destination);
      o.start(t0);
      o.stop(t0 + 0.012);
    } catch (_) { /* ignore */ }
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

  /** Filtered noise burst (cassette slide / sci-fi hiss). iOS-safe — no theme touch. */
  function noiseBurst(dur, gain, filterFreq, filterType) {
    if (muted) return;
    const c = ensureCtx();
    if (!c) return;
    try {
      const t0 = c.currentTime;
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const env = 1 - i / len;
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const src = c.createBufferSource();
      src.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = filterType || 'bandpass';
      filter.frequency.setValueAtTime(filterFreq || 1200, t0);
      filter.Q.setValueAtTime(0.8, t0);
      const g = c.createGain();
      g.gain.setValueAtTime(gain == null ? 0.06 : gain, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(c.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    } catch (_) { /* ignore */ }
  }

  const SFX = {
    beam() {
      // Sci-fi cooler beam: rising sweep + pulse throb + airy hiss
      if (muted) return;
      const c = ensureCtx();
      if (!c) {
        tone(220, 0.08, 'sawtooth', 0.06);
        return;
      }
      try {
        const t0 = c.currentTime;
        // Rising carrier sweep
        const o1 = c.createOscillator();
        const g1 = c.createGain();
        o1.type = 'sawtooth';
        o1.frequency.setValueAtTime(180, t0);
        o1.frequency.exponentialRampToValueAtTime(620, t0 + 0.28);
        g1.gain.setValueAtTime(0.045, t0);
        g1.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
        o1.connect(g1);
        g1.connect(c.destination);
        o1.start(t0);
        o1.stop(t0 + 0.34);
        // Soft triangle shimmer
        const o2 = c.createOscillator();
        const g2 = c.createGain();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(440, t0);
        o2.frequency.linearRampToValueAtTime(880, t0 + 0.22);
        g2.gain.setValueAtTime(0.035, t0);
        g2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.26);
        o2.connect(g2);
        g2.connect(c.destination);
        o2.start(t0);
        o2.stop(t0 + 0.28);
        // Low pulse throb
        const o3 = c.createOscillator();
        const g3 = c.createGain();
        o3.type = 'sine';
        o3.frequency.setValueAtTime(70, t0);
        g3.gain.setValueAtTime(0.05, t0);
        g3.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
        o3.connect(g3);
        g3.connect(c.destination);
        o3.start(t0);
        o3.stop(t0 + 0.22);
      } catch (_) { /* ignore */ }
      noiseBurst(0.22, 0.028, 2400, 'bandpass');
      setTimeout(function () { noiseBurst(0.12, 0.02, 3200, 'highpass'); }, 80);
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
    explode() {
      tone(60, 0.25, 'sawtooth', 0.14);
      setTimeout(() => tone(40, 0.35, 'square', 0.12), 60);
      setTimeout(() => tone(90, 0.2, 'sawtooth', 0.1), 140);
      setTimeout(() => tone(30, 0.5, 'triangle', 0.08), 220);
      setTimeout(() => tone(120, 0.15, 'square', 0.06), 400);
    },
    landing() {
      tone(180, 0.1, 'triangle', 0.06);
      setTimeout(() => tone(240, 0.12, 'triangle', 0.05), 80);
      setTimeout(() => tone(120, 0.25, 'sawtooth', 0.04), 180);
    },
    cassette() {
      // Cassette sliding into a car stereo: scrape → thunk → soft click
      // Does not touch theme play timing (iOS-safe).
      if (muted) return;
      const c = ensureCtx();
      if (!c) {
        tone(180, 0.04, 'square', 0.05);
        return;
      }
      // 1) Mechanical slide / plastic scrape
      noiseBurst(0.16, 0.07, 900, 'bandpass');
      noiseBurst(0.14, 0.04, 1800, 'highpass');
      try {
        const t0 = c.currentTime;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(220, t0);
        o.frequency.exponentialRampToValueAtTime(70, t0 + 0.14);
        g.gain.setValueAtTime(0.035, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
        o.connect(g);
        g.connect(c.destination);
        o.start(t0);
        o.stop(t0 + 0.18);
      } catch (_) { /* ignore */ }
      // 2) Thunk — tape seats in the deck
      setTimeout(function () {
        tone(75, 0.09, 'sine', 0.1);
        tone(55, 0.11, 'triangle', 0.07);
        noiseBurst(0.06, 0.05, 400, 'lowpass');
      }, 130);
      // 3) Soft plastic click / latch
      setTimeout(function () {
        tone(980, 0.025, 'square', 0.035);
        tone(620, 0.04, 'triangle', 0.025);
        noiseBurst(0.035, 0.025, 2800, 'highpass');
      }, 230);
    },
    smoke() {
      tone(160, 0.05, 'sine', 0.03);
    },
    // Tiny shed instrument gags (Retrofit-ish one-shot stingers)
    drums() {
      tone(75, 0.07, 'sine', 0.11);
      setTimeout(() => tone(55, 0.1, 'triangle', 0.08), 35);
      setTimeout(() => noiseBurst(0.05, 0.04, 900, 'bandpass'), 20);
      setTimeout(() => tone(90, 0.05, 'square', 0.04), 110);
    },
    bass() {
      tone(98, 0.16, 'sawtooth', 0.07);
      setTimeout(() => tone(73, 0.2, 'sine', 0.055), 80);
      setTimeout(() => tone(49, 0.18, 'triangle', 0.04), 160);
    },
    keys() {
      // G major-ish sparkle
      tone(392, 0.1, 'triangle', 0.055);
      setTimeout(() => tone(493, 0.12, 'triangle', 0.05), 60);
      setTimeout(() => tone(587, 0.16, 'triangle', 0.045), 130);
    },
    guitar() {
      tone(196, 0.07, 'sawtooth', 0.05);
      setTimeout(() => tone(247, 0.09, 'sawtooth', 0.045), 45);
      setTimeout(() => tone(294, 0.14, 'triangle', 0.04), 100);
      setTimeout(() => tone(392, 0.1, 'triangle', 0.03), 180);
    },
  };

  global.MothershipAudio = {
    play(name) {
      const fn = SFX[name];
      if (fn) fn();
    },
    isMuted() { return muted; },
    setMuted(v) {
      muted = !!v;
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
      syncMusicPlayback();
    },
    toggle() {
      this.setMuted(!muted);
      return muted;
    },
    /**
     * Resume AudioContext only (silent beep OK).
     * Never play/pause the theme element — that burns the iOS gesture
     * before playTheme() can use it.
     */
    unlock() {
      musicUnlocked = true;
      const c = ensureCtx();
      silentWarmBeep(c);
    },
    /** Create + preload theme element early (Start / grab). Does not play. */
    warm() {
      ensureMusic();
      ensureCtx();
    },
    /**
     * Start looping theme. Call inside the same user-gesture stack as title
     * cassette insert (iOS/Safari blocks delayed play()). el.play() is synchronous here.
     */
    playTheme() {
      musicWanted = true;
      musicUnlocked = true;
      ensureCtx();
      const el = ensureMusic();
      if (!el) return;
      if (muted) {
        clearPlayRetry();
        try { el.pause(); } catch (_) { /* ignore */ }
        return;
      }
      tryPlayElement(el);
    },
    stopTheme() {
      musicWanted = false;
      clearPlayRetry();
      const el = musicEl;
      if (el) {
        try {
          el.pause();
          el.currentTime = 0;
        } catch (_) { /* ignore */ }
      }
    },
    pauseTheme() {
      const el = musicEl;
      if (el) {
        try { el.pause(); } catch (_) { /* ignore */ }
      }
    },
    isThemeWanted() { return musicWanted; },
    isUnlocked() { return musicUnlocked; },
  };
})(window);
