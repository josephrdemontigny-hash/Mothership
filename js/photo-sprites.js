(function (global) {
  var PHOTOS = global.MothershipCharPhotos || {};
  var IMGS = {};
  ["zakk", "tayler"].forEach(function (k) {
    if (!PHOTOS[k]) return;
    var img = new Image();
    img._ready = false;
    img.onload = function () { img._ready = true; };
    img.src = PHOTOS[k];
    IMGS[k] = img;
  });
  function ready(k) {
    var img = IMGS[k];
    return !!(img && img._ready && img.naturalWidth);
  }
  function drawCutout(ctx, key, x, y, facing, moving, t, opts) {
    opts = opts || {};
    if (!ready(key)) return false;
    var img = IMGS[key];
    var seated = !!opts.seated;
    var targetH = seated ? 190 : 300;
    var aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
    var drawH = targetH;
    var drawW = drawH * aspect;
    var f = facing >= 0 ? 1 : -1;
    var bob = moving ? Math.sin((t || 0) * 0.012) * 3.5 : 0;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 2, Math.max(12, drawW * 0.22), 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(x, y - bob);
    ctx.scale(f, 1);
    ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
    ctx.restore();
    return true;
  }
  function wrap() {
    var W = global.MothershipWorld;
    if (!W) return;
    W.drawZakk = function (ctx, x, y, facing, moving, t, opts) {
      drawCutout(ctx, "zakk", x, y, facing, moving, t, opts || {});
    };
    W.drawTayler = function (ctx, x, y, facing, moving, t, opts) {
      drawCutout(ctx, "tayler", x, y, facing, moving, t, opts || {});
    };
  }
  wrap();
  document.addEventListener("DOMContentLoaded", wrap);
  setTimeout(wrap, 0);
  setTimeout(wrap, 400);
})(window);
