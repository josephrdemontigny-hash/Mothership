/**
 * Neon trading-card portraits — wraps MothershipWorld draw calls.
 * Photo data URLs live in js/chars/*.js
 */
(function (global) {
  const PHOTOS = global.MothershipCharPhotos || {};
  const SRC = {
    zakk: PHOTOS.zakk,
    tayler: PHOTOS.tayler,
    blazer: PHOTOS.blazer,
    graphic: PHOTOS.graphic,
    denim: PHOTOS.denim,
    raglan: PHOTOS.raglan,
  };
  SRC.western = SRC.zakk;
  SRC.plaid = SRC.tayler;

  const IMGS = {};
  Object.keys(SRC).forEach(function (key) {
    if (!SRC[key]) return;
    const img = new Image();
    img._ready = false;
    img.onload = function () { img._ready = true; };
    img.src = SRC[key];
    IMGS[key] = img;
  });

  function ready(key) {
    const img = IMGS[key];
    return !!(img && img._ready && img.naturalWidth);
  }

  function drawPhoto(ctx, key, x, y, facing, moving, t, opts) {
    opts = opts || {};
    if (!ready(key)) return false;
    const img = IMGS[key];
    const seated = !!opts.seated;
    const scale = opts.scale != null ? opts.scale : 1.48;
    const f = facing >= 0 ? 1 : -1;
    const bob = moving ? Math.sin((t || 0) * 0.012) * 2.2 : 0;
    const standH = seated ? 86 : 124;
    const drawH = standH * scale;
    const aspect = img.naturalWidth / img.naturalHeight;
    const drawW = drawH * aspect * 0.92;
    ctx.save();
    if (!opts.noShadow) {
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(x + 2, y + 1, drawW * 0.28, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.translate(x, y - bob);
    ctx.scale(f, 1);
    ctx.shadowColor = 'rgba(180, 80, 255, 0.35)';
    ctx.shadowBlur = 14;
    ctx.drawImage(img, -drawW / 2, -drawH + 2, drawW, drawH);
    ctx.shadowBlur = 0;
    ctx.restore();
    return true;
  }

  function label(ctx, x, y, name) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.font = 'bold 10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 14);
    ctx.textAlign = 'left';
  }

  function wrap() {
    const W = global.MothershipWorld;
    if (!W || W._photosWrapped) return;
    W._photosWrapped = true;
    const origZ = W.drawZakk;
    const origT = W.drawTayler;
    const origB = W.drawBandMate;
    W.drawZakk = function (ctx, x, y, facing, moving, t, opts) {
      opts = opts || {};
      if (drawPhoto(ctx, 'zakk', x, y, facing, moving, t, opts)) {
        if (!opts.noLabel) label(ctx, x, y, 'Zakk');
        return;
      }
      return origZ.apply(this, arguments);
    };
    W.drawTayler = function (ctx, x, y, facing, moving, t, opts) {
      opts = opts || {};
      if (drawPhoto(ctx, 'tayler', x, y, facing, moving, t, opts)) {
        if (!opts.noLabel) label(ctx, x, y, 'Tayler');
        return;
      }
      return origT.apply(this, arguments);
    };
    W.drawBandMate = function (ctx, x, y, look, t, opts) {
      opts = opts || {};
      const key = SRC[look] ? look : 'denim';
      if (drawPhoto(ctx, key, x, y, opts.facing != null ? opts.facing : 1, !!opts.moving, t, opts)) return;
      return origB.apply(this, arguments);
    };
  }

  if (global.MothershipWorld) wrap();
  else document.addEventListener('DOMContentLoaded', wrap);
})(window);
