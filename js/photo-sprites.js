(function (global) {
  function bobY(moving, t) { return moving ? Math.sin((t || 0) * 0.012) * 2.2 : 0; }
  function shadow(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x, y + 2, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  function label(ctx, x, y, name) {
    ctx.fillStyle = '#f4e8ff'; ctx.font = 'bold 10px Segoe UI, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText(name, x, y + 14); ctx.textAlign = 'left';
  }
  function drawZakkCard(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    var f = facing >= 0 ? 1 : -1;
    var seated = !!opts.seated;
    ctx.save();
    shadow(ctx, x, y);
    ctx.translate(x, y - bobY(moving, t));
    ctx.scale(f, 1);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-10, seated ? -22 : -18, 8, seated ? 14 : 20); ctx.fillRect(2, seated ? -22 : -18, 8, seated ? 14 : 20);
    ctx.fillStyle = '#111'; ctx.fillRect(-12, -48, 24, 32);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-12, -48, 24, 8);
    ctx.strokeStyle = '#c8c8c8'; ctx.lineWidth = 1; ctx.strokeRect(-10, -44, 20, 6);
    ctx.fillStyle = '#d8b090'; ctx.fillRect(-16, -42, 5, 18); ctx.fillRect(11, -42, 5, 18);
    ctx.beginPath(); ctx.arc(0, -58, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2418'; ctx.fillRect(-7, -54, 14, 3);
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(0, -68, 12, 6, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(-12, -68, 24, 6);
    ctx.fillStyle = '#c44'; ctx.fillRect(-4, -50, 3, 4);
    ctx.restore();
    if (!opts.noLabel) label(ctx, x, y, 'Zakk');
  }
  function drawTaylerCard(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    var f = facing >= 0 ? 1 : -1;
    var seated = !!opts.seated;
    ctx.save();
    shadow(ctx, x, y);
    ctx.translate(x, y - bobY(moving, t));
    ctx.scale(f, 1);
    ctx.fillStyle = '#2a1a14'; ctx.fillRect(-10, seated ? -22 : -18, 8, seated ? 14 : 20); ctx.fillRect(2, seated ? -22 : -18, 8, seated ? 14 : 20);
    ctx.fillStyle = '#6a2430'; ctx.fillRect(-13, -50, 26, 34);
    ctx.fillStyle = '#3a1420';
    for (var i = 0; i < 5; i++) ctx.fillRect(-13, -48 + i * 6, 26, 2);
    ctx.fillStyle = '#d8b090'; ctx.fillRect(-16, -44, 5, 18); ctx.fillRect(11, -44, 5, 18);
    ctx.beginPath(); ctx.arc(0, -60, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6a2030'; ctx.fillRect(-11, -72, 22, 8);
    ctx.fillRect(-6, -66, 12, 6);
    ctx.restore();
    if (!opts.noLabel) label(ctx, x, y, 'Tayler');
  }
  function drawMateCard(ctx, x, y, look, t, opts) {
    opts = opts || {};
    var colors = { denim: '#3a5a88', blazer: '#2a2a40', graphic: '#c03040', raglan: '#2a6a3a', western: '#1a1a1a', plaid: '#6a2430' };
    ctx.save();
    shadow(ctx, x, y);
    ctx.translate(x, y);
    ctx.fillStyle = colors[look] || '#445';
    ctx.fillRect(-12, -48, 24, 32);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-10, -18, 8, 20); ctx.fillRect(2, -18, 8, 20);
    ctx.fillStyle = '#d8b090'; ctx.beginPath(); ctx.arc(0, -56, 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function wrap() {
    var W = global.MothershipWorld;
    if (!W || W._photosWrapped) return;
    W._photosWrapped = true;
    W.drawZakk = function (ctx, x, y, facing, moving, t, opts) {
      drawZakkCard(ctx, x, y, facing, moving, t, opts || {});
    };
    W.drawTayler = function (ctx, x, y, facing, moving, t, opts) {
      drawTaylerCard(ctx, x, y, facing, moving, t, opts || {});
    };
    var origB = W.drawBandMate;
    W.drawBandMate = function (ctx, x, y, look, t, opts) {
      if (look === 'western') return drawZakkCard(ctx, x, y, 1, false, t, opts || { noLabel: true });
      if (look === 'plaid') return drawTaylerCard(ctx, x, y, 1, false, t, opts || { noLabel: true });
      drawMateCard(ctx, x, y, look, t, opts || {});
    };
  }
  if (global.MothershipWorld) wrap();
  else document.addEventListener('DOMContentLoaded', wrap);
})(window);
