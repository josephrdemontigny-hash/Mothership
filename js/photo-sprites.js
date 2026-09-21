/**
 * Photo cutout avatars (Pokémon GO–style motion, no card chrome).
 * Loads assets/zakk-cutout.png + assets/tayler-cutout.png.
 * Falls back to canvas vector drawZakk/drawTayler if images fail.
 * Standing height matches MothershipWorld.STANDING_HEIGHT.
 */
(function (global) {
  var PATHS = {
    zakk: "assets/zakk-cutout.png?v=18",
    tayler: "assets/tayler-cutout.png?v=18",
  };
  var IMGS = {};
  var LABELS = { zakk: "Zakk", tayler: "Tayler" };
  /** Transparent pad trim (px) so visible feet sit on ground y */
  var TRIM = {
    zakk: { top: 20, bottom: 20, left: 30, right: 31 },
    tayler: { top: 20, bottom: 20, left: 22, right: 23 },
  };

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
    return 1.72;
  }

  /**
   * Shared screen height (px), scaled when opts.scale overrides CHAR_SCALE.
   * Photo cutouts stay at STANDING_HEIGHT by default — seated pose must NOT
   * shrink the sprite unless opts.seatedCrop is explicitly set (avoids the
   * shed Tayler ~2/3-height bug when only pose flags are passed).
   */
  function targetHeight(opts, seated) {
    var W = global.MothershipWorld;
    var defSc = W && W.CHAR_SCALE != null ? W.CHAR_SCALE : 1.72;
    var stand = W && W.STANDING_HEIGHT != null ? W.STANDING_HEIGHT : Math.round(73 * defSc);
    var seat = W && W.SEATED_HEIGHT != null ? W.SEATED_HEIGHT : Math.round(52 * defSc);
    var cropSeat = !!(opts && opts.seatedCrop);
    var base = cropSeat && seated ? seat : stand;
    var sc = charScale(opts);
    return base * (sc / defSc);
  }

  function poseMotion(moving, seated, t) {
    var tt = t || 0;
    if (seated) {
      return {
        bob: 0,
        sway: 0,
        lean: 0,
        squash: 1,
        stretch: 1,
        phase: 0,
        walk: 0,
      };
    }
    if (!moving) {
      // IDLE: completely still — no bob, sway, or lean
      return {
        bob: 0,
        sway: 0,
        lean: 0,
        squash: 1,
        stretch: 1,
        phase: 0,
        walk: 0,
      };
    }
    // WALKING: smooth side-profile stride (slow phase, modest motion)
    var phase = tt * 0.018;
    var s = Math.sin(phase);
    var absS = Math.abs(s);
    var land = Math.max(0, Math.cos(phase * 2));
    var squash = 1 - land * 0.018;
    var stretch = 1 + absS * 0.012;
    return {
      bob: Math.min(1.2, absS * 1.15), // torso bob only — feet stay planted
      sway: s * 0.35,
      lean: Math.min(2, 1.6 + absS * 0.35),
      squash: squash,
      stretch: stretch,
      phase: phase,
      walk: s,
    };
  }

  function drawSoftShadow(ctx, x, y, drawW, seated, sway) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    var rx = Math.max(9, drawW * (seated ? 0.28 : 0.24));
    var ry = seated ? 4.2 : 5.2;
    // Exact foot y — no +1.5 gap
    ctx.ellipse(x + 2 + sway * 0.12, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Subtle limb motion for photo cutouts: layered soft warps of arm/leg
   * regions (no stick limbs). Legs shear opposite to arms.
   * Bob is applied to torso/arms only so feet stay locked to ground.
   */
  function drawCutoutBody(ctx, img, srcX, srcY, srcW, srcH, drawW, drawH, motion) {
    var walk = motion.walk || 0;
    var bob = motion.bob || 0;
    if (!motion.walk) {
      // Idle / seated: full body, optional tiny torso bob unused (0)
      ctx.drawImage(img, srcX, srcY, srcW, srcH, -drawW / 2, -drawH, drawW, drawH);
      return;
    }

    var legTop = 0.44;
    var armBandTop = 0.62;
    var armBandBot = 0.28;
    var s = walk;
    var legShear = s * 0.035; // smooth stride shear
    var armShear = -s * 0.028;
    var legLift = Math.abs(s) * 0.55; // slight plant/swing — not floaty
    var armSwing = s * 1.4;
    var strideX = s * 0.75;

    function blitFrac(y0Frac, y1Frac, shear, dx, dy, pivotYFrac) {
      var top = -drawH * y1Frac;
      var bot = -drawH * y0Frac;
      var h = bot - top;
      if (h <= 0.5) return;
      var srcTop = srcY + srcH * (1 - y1Frac);
      var srcBot = srcY + srcH * (1 - y0Frac);
      var srcSliceH = Math.max(1, srcBot - srcTop);
      ctx.save();
      ctx.beginPath();
      ctx.rect(-drawW / 2 - 6, top - 2, drawW + 12, h + 4);
      ctx.clip();
      var pivotY = -drawH * (pivotYFrac != null ? pivotYFrac : (y0Frac + y1Frac) * 0.5);
      ctx.translate(dx || 0, dy || 0);
      ctx.translate(0, pivotY);
      ctx.transform(1, 0, shear, 1, 0, 0);
      ctx.translate(0, -pivotY);
      ctx.drawImage(
        img,
        srcX,
        srcTop,
        srcW,
        srcSliceH,
        -drawW / 2,
        top,
        drawW,
        h
      );
      ctx.restore();
    }

    // Legs stay foot-locked (no vertical bob). Plant foot dy ≈ 0.
    blitFrac(0, legTop, -legShear * 0.85, -strideX * 0.85, s > 0 ? 0 : legLift * 0.35, 0.18);
    blitFrac(0, legTop, legShear, strideX * 0.95, s < 0 ? 0 : legLift * 0.35, 0.18);
    // Torso + head — bob above ankles only
    blitFrac(legTop, 1, -s * 0.008, strideX * 0.15, -bob, 0.74);
    // Soft arm band opposite the legs
    blitFrac(armBandBot, armBandTop, armShear, -armSwing * 0.18, -bob - Math.abs(s) * 0.3, 0.48);
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
    var trim = TRIM[key] || { top: 0, bottom: 0, left: 0, right: 0 };
    var srcX = trim.left;
    var srcY = trim.top;
    var srcW = img.naturalWidth - trim.left - trim.right;
    var srcH = img.naturalHeight - trim.top - trim.bottom;
    if (srcW < 8 || srcH < 8) {
      srcX = 0;
      srcY = 0;
      srcW = img.naturalWidth;
      srcH = img.naturalHeight;
    }
    var aspect = srcW / Math.max(1, srcH);
    var drawH = targetH;
    var drawW = drawH * aspect;
    var f = facing >= 0 ? 1 : -1;
    var bob = motion.bob;
    var sway = motion.sway;
    var leanDeg = motion.lean * 0.018 * f;

    // Legs crop only when explicitly requested (seatedCrop)
    if (seated && opts.seatedCrop) {
      var cropFrac = 0.12;
      srcH = Math.floor(srcH * (1 - cropFrac));
      aspect = srcW / Math.max(1, srcH);
      drawH = targetH;
      drawW = drawH * aspect;
    }

    if (!opts.noShadow) {
      drawSoftShadow(ctx, x, y, drawW, seated, sway);
    }

    // Feet locked to y — do NOT lift whole sprite with bob
    ctx.save();
    ctx.translate(x + sway * 0.25, y);
    ctx.rotate(leanDeg);
    ctx.scale(f * motion.stretch, motion.squash);
    drawCutoutBody(ctx, img, srcX, srcY, srcW, srcH, drawW, drawH, motion);
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
