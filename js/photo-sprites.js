(function (global) {
  function bobY(moving, t) { return moving ? Math.sin((t || 0) * 0.012) * 3 : 0; }
  function glow(ctx) {
    ctx.shadowColor = 'rgba(255, 60, 200, 0.75)';
    ctx.shadowBlur = 16;
  }
  function label(ctx, x, y, name) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff7ad8';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y + 16);
    ctx.restore();
  }
  function drawZakkCard(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    var f = facing >= 0 ? 1 : -1;
    var s = opts.seated ? 0.82 : 1.15;
    ctx.save();
    ctx.translate(x, y - bobY(moving, t));
    ctx.scale(f * s, s);
    glow(ctx);
    ctx.fillStyle = '#111'; ctx.fillRect(-12, -22, 10, 24); ctx.fillRect(2, -22, 10, 24);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-16, -58, 32, 40);
    ctx.fillStyle = '#ececec'; ctx.fillRect(-10, -52, 20, 5);
    ctx.fillStyle = '#d8b090'; ctx.fillRect(-20, -50, 6, 22); ctx.fillRect(14, -50, 6, 22);
    ctx.beginPath(); ctx.arc(0, -70, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a2a18'; ctx.fillRect(-9, -66, 18, 4);
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(0, -82, 16, 8, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(-16, -82, 32, 8);
    ctx.restore();
    if (!opts.noLabel) label(ctx, x, y, 'ZAKK');
  }
  function drawTaylerCard(ctx, x, y, facing, moving, t, opts) {
    opts = opts || {};
    var f = facing >= 0 ? 1 : -1;
    var s = opts.seated ? 0.82 : 1.15;
    ctx.save();
    ctx.translate(x, y - bobY(moving, t));
    ctx.scale(f * s, s);
    glow(ctx);
    ctx.fillStyle = '#2a1a14'; ctx.fillRect(-12, -22, 10, 24); ctx.fillRect(2, -22, 10, 24);
    ctx.fillStyle = '#7a2038'; ctx.fillRect(-16, -60, 32, 42);
    ctx.fillStyle = '#3a1020';
    for (var i = 0; i < 6; i++) ctx.fillRect(-16, -58 + i * 7, 32, 2);
    ctx.fillStyle = '#d8b090'; ctx.fillRect(-20, -52, 6, 22); ctx.fillRect(14, -52, 6, 22);
    ctx.beginPath(); ctx.arc(0, -72, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6a1428'; ctx.fillRect(-14, -88, 28, 10); ctx.fillRect(-8, -80, 16, 8);
    ctx.restore();
    if (!opts.noLabel) label(ctx, x, y, 'TAYLER');
  }
  function wrap() {
    var W = global.MothershipWorld;
    if (!W) return;
    W.drawZakk = function (ctx, x, y, facing, moving, t, opts) {
      drawZakkCard(ctx, x, y, facing, moving, t, opts || {});
    };
    W.drawTayler = function (ctx, x, y, facing, moving, t, opts) {
      drawTaylerCard(ctx, x, y, facing, moving, t, opts || {});
    };
  }
  wrap();
  document.addEventListener('DOMContentLoaded', wrap);
  setTimeout(wrap, 0);
  setTimeout(wrap, 250);
})(window);
