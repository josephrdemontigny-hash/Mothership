/**
 * Photo cutout avatars (Pokémon GO–style motion, no card chrome).
 * Loads assets/zakk-cutout.png + assets/tayler-cutout.png.
 * Falls back to canvas vector drawZakk/drawTayler if images fail.
 */
(function (global) {
  var PATHS = {
    zakk: "assets/zakk-cutout.png",
    tayler: "assets/tayler-cutout.png",
  };
  var IMGS = {};
  var LABELS = { zakk: "Zakk", tayler: "Tayler" };

  Object.keys(PATHS).forEach(function (k) {
    var img = new Image();
    img._ready = false;
    img._failed = false;
    img.onerror = function () {
      img._failed = true;
      img._ready = false;
    };
    img.onload = function () {
      img._ready = !!(img.naturalWidth && img.naturalHeight);
    };
    img.src = PATHS[k];
    IMGS[k] = img;
  });

  function ready(k) {
    var img = IMGS[k];
    return !!(img && img._ready && img.naturalWidth && !img._failed);
  }

  function charScale(opts) {
    var W = global.MothershipWorld;
    if (opts && opts.scale != null) return opts.scale;
    if (W && W.CHAR_SCALE != null) return W.CHAR_SCALE;
    return 1.48;
  }

  /** Match vector avatar footprint (~62 local units × CHAR_SCALE). */
  function targetHeight(opts, seated) {
    var sc = charScale(opts);
    var base = seated ? 78 : 108;
    return base * sc;
  }

  function poseMotion(moving, seated, t) {
    var tt = t || 0;
    if (seated) {
      return {
        bob: Math.sin(tt * 0.0035) * 0.6,
        sway: Math.sin(tt * 0.0022) * 0.35,
        lean: 0.2,
        squash: 1,
        stretch: 1,
      };
    }
    if (!moving) {
      // Idle: gentle vertical bob + tiny sway
      return {
        bob: Math.sin(tt * 0.0042) * 2.2,
        sway: Math.sin(tt * 0.0028) * 1.1,
        lean: 0.15,
        squash: 1,
        stretch: 1,
      };
    }
    // Walk: stronger bounce synced to step, lean into facing, soft land squash
    var phase = tt * 0.028;
    var s = Math.sin(phase);
    var absS = Math.abs(s);
    var land = Math.max(0, Math.cos(phase * 2)); // peaks when feet plant
    var squash = 1 - land * 0.045;
    var stretch = 1 + absS * 0.035;
    return {
      bob: absS * 5.5,
      sway: s * 2.4,
      lean: 3.2 + absS * 0.6,
      squash: squash,
      stretch: stretch,
    };
  }

  function drawSoftShadow(ctx, x, y, drawW, seated, sway) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    var rx = Math.max(9, drawW * (seated ? 0.28 : 0.24));
    var ry = seated ? 4.2 : 5.2;
    ctx.ellipse(x + 2 + sway * 0.12, y + 1.5, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function attachJoint(ctx, key, x, y, facing, drawH, bob, opts) {
    var W = global.MothershipWorld;
    if (!opts || !opts.smoking || !W || typeof W.drawJoint !== "function") return;
    var f = facing >= 0 ? 1 : -1;
    var sc = charScale(opts);
    var seated = !!opts.seated;
    var jointLit = !!opts.jointLit;
    var puffing = !!opts.puffing && jointLit;
    var puffProg = opts.puffProg != null ? opts.puffProg : puffing ? 1 : 0;

    // Approximate near-hand tip on cutout silhouette
    var hx = x + f * (seated ? 16 : 20) * Math.max(0.85, sc * 0.72);
    var hy = y - drawH * (seated ? 0.4 : 0.46) - bob;
    var jx = hx;
    var jy = hy;
    var jang = f > 0 ? -0.85 : Math.PI + 0.85;
    if (puffing) {
      var rise = 0.55 + puffProg * 0.45;
      var mx = x + f * 10 * sc;
      var my = y - drawH * 0.72 - bob;
      jx = hx + (mx - hx) * rise;
      jy = hy + (my - hy) * rise;
      jang = f > 0 ? -0.85 + 0.35 * rise : Math.PI + 0.85 - 0.35 * rise;
    }
    W.drawJoint(ctx, jx, jy, jang, { lit: jointLit, len: 11, lineW: 2 });
    if (puffing && typeof W.drawSmokePuffs === "function") {
      var mouthX = x + f * 10 * sc;
      var mouthY = y - drawH * 0.72 - bob;
      var mul = 1.6 + puffProg * 1.0;
      W.drawSmokePuffs(ctx, mouthX + f * 10, mouthY, opts._t || 0, mul);
      W.drawSmokePuffs(ctx, mouthX + f * 4, mouthY - 12, (opts._t || 0) + 280, 1.2 + puffProg * 0.6);
    }
  }

  function drawCutout(ctx, key, x, y, facing, moving, t, opts) {
    opts = opts || {};
    if (!ready(key)) return false;
    var img = IMGS[key];
    var seated = !!opts.seated;
    var motion = poseMotion(!!moving, seated, t);
    var targetH = targetHeight(opts, seated);
    var aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
    var drawH = targetH;
    var drawW = drawH * aspect;
    var f = facing >= 0 ? 1 : -1;
    var bob = motion.bob;
    var sway = motion.sway;
    var leanDeg = motion.lean * 0.018 * f; // small lean into facing while walking

    // Seated: crop bottom slightly (shorter draw) — hide lower legs a bit
    var srcX = 0;
    var srcY = 0;
    var srcW = img.naturalWidth;
    var srcH = img.naturalHeight;
    if (seated) {
      var cropFrac = 0.12;
      srcH = Math.floor(img.naturalHeight * (1 - cropFrac));
      aspect = srcW / Math.max(1, srcH);
      drawH = targetH;
      drawW = drawH * aspect;
    }

    if (!opts.noShadow) {
      drawSoftShadow(ctx, x, y, drawW, seated, sway);
    }

    ctx.save();
    ctx.translate(x + sway * 0.35, y - bob);
    ctx.rotate(leanDeg);
    ctx.scale(f * motion.stretch, motion.squash);
    // Feet anchored at (0,0); image drawn upward
    ctx.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH);
    ctx.restore();

    opts._t = t;
    attachJoint(ctx, key, x, y, facing, drawH, bob, opts);

    if (!opts.noLabel) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.font = "bold 10px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(LABELS[key] || key, x, y + 14);
      ctx.textAlign = "left";
    }
    return true;
  }

  function wrap() {
    var W = global.MothershipWorld;
    if (!W || W._photoSpritesWrapped) return;
    W._photoSpritesWrapped = true;
    var origZ = W.drawZakk;
    var origT = W.drawTayler;
    W.drawZakk = function (ctx, x, y, facing, moving, t, opts) {
      if (!drawCutout(ctx, "zakk", x, y, facing, moving, t, opts || {})) {
        if (origZ) origZ(ctx, x, y, facing, moving, t, opts);
      }
    };
    W.drawTayler = function (ctx, x, y, facing, moving, t, opts) {
      if (!drawCutout(ctx, "tayler", x, y, facing, moving, t, opts || {})) {
        if (origT) origT(ctx, x, y, facing, moving, t, opts);
      }
    };
  }

  wrap();
  document.addEventListener("DOMContentLoaded", wrap);
  setTimeout(wrap, 0);
  setTimeout(wrap, 400);
})(window);
