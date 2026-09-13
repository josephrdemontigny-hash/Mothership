/**
 * Tiny Web Audio beep engine + theme music for Mothership.
 * Mute persists in localStorage. Theme starts on cockpit cassette insert
 * (must call playTheme inside the same user gesture for iOS/Safari);
 * keeps playing through fly + results; stops on title / new game only.
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

  function ensureMusic() {
    if (!musicEl) {
      musicEl = new Audio(THEME_SRC);
      musicEl.loop = true;
      musicEl.preload = 'auto';
      musicEl.volume = 0.55;
      // Kick off network fetch early (does not require a gesture)
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
      p = el.play();
    } catch (_) {
      schedulePlayRetry();
      return;
    }
    if (p && typeof p.then === 'function') {
      p.then(function () {
        clearPlayRetry();
      }).catch(function () {
        // Autoplay / gesture may have expired — retry briefly while wanted
        schedulePlayRetry();
      });
    }
  }

  function schedulePlayRetry() {
    if (!musicWanted || muted || !musicUnlocked) return;
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
    if (!musicUnlocked) {
      // Still try — some browsers allow it after prior unlock; retry if rejected
      tryPlayElement(el);
      return;
    }
    tryPlayElement(el);
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
    cassette() {
      tone(180, 0.04, 'square', 0.05);
      setTimeout(() => tone(90, 0.08, 'sawtooth', 0.06), 50);
      setTimeout(() => tone(140, 0.06, 'triangle', 0.04), 120);
      setTimeout(() => tone(400, 0.1, 'sine', 0.05), 200);
    },
    smoke() {
      tone(160, 0.05, 'sine', 0.03);
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
    /** Mark gesture unlock + warm AudioContext / HTMLAudioElement. Safe to call often. */
    unlock() {
      musicUnlocked = true;
      ensureCtx();
      ensureMusic();
      const el = musicEl;
      if (el) {
        const wasWanted = musicWanted && !muted;
        // Prime play() inside the gesture; pause again if theme not wanted yet
        const p = el.play();
        if (p && typeof p.then === 'function') {
          p.then(function () {
            if (!wasWanted) {
              try { el.pause(); } catch (_) { /* ignore */ }
            } else {
              syncMusicPlayback();
            }
          }).catch(function () {
            // Gesture may still unlock on a later successful playTheme
            if (wasWanted) syncMusicPlayback();
          });
        }
      }
    },
    /** Create + preload theme element early (Start / grab). Does not require unlock. */
    warm() {
      ensureMusic();
      ensureCtx();
    },
    /**
     * Start looping theme. Call inside the same user-gesture tick as insert
     * (iOS/Safari blocks delayed play()). Retries if play() rejects.
     */
    playTheme() {
      musicWanted = true;
      musicUnlocked = true;
      ensureCtx();
      ensureMusic();
      syncMusicPlayback();
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
