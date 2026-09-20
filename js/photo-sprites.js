(function (global) {
  function walkSwing(moving, t, side) {
    if (!moving) return 0;
    return Math.sin((t || 0) * 0.014) * 10 * side;
  }
  function goAvatar(ctx, x, y, facing, moving, t, look) {
    var seated = !!(look.seated);
    var f = facing >= 0 ? 1 : -1;
    var scale = seated ? 1.35 : 1.72;
    var bob = moving ? Math.abs(Math.sin((t || 0) * 0.014)) * 3 : 0;
    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(f * scale, scale);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(0, 2, 14, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    var skin = look.skin || '#e0b898';
    var skinD = look.skinD || '#c49270';
    var swing = walkSwing(moving, t, 1);
    var swingB = walkSwing(moving, t, -1);
    if (!seated) {
      ctx.save(); ctx.translate(-6, 0); ctx.rotate(swing * 0.012);
      ctx.fillStyle = look.shoe || '#1a1a1a'; ctx.fillRect(-5, -6, 11, 8); ctx.fillStyle = '#eee'; ctx.fillRect(-5, 0, 11, 3);
      ctx.fillStyle = look.pant || '#1c1c24'; ctx.fillRect(-4, -28, 9, 24);
      ctx.restore();
      ctx.save(); ctx.translate(6, 0); ctx.rotate(swingB * 0.012);
      ctx.fillStyle = look.shoe || '#1a1a1a'; ctx.fillRect(-5, -6, 11, 8); ctx.fillStyle = '#eee'; ctx.fillRect(-5, 0, 11, 3);
      ctx.fillStyle = look.pant || '#1c1c24'; ctx.fillRect(-4, -28, 9, 24);
      ctx.restore();
    } else {
      ctx.fillStyle = look.pant || '#1c1c24'; ctx.fillRect(-14, -16, 12, 10); ctx.fillRect(2, -16, 12, 10);
    }
    ctx.fillStyle = look.shirt || '#222';
    ctx.beginPath();
    ctx.moveTo(-13, seated ? -22 : -30);
    ctx.lineTo(13, seated ? -22 : -30);
    ctx.lineTo(11, seated ? -8 : -8);
    ctx.lineTo(-11, seated ? -8 : -8);
    ctx.closePath(); ctx.fill();
    if (look.plaid) {
      ctx.strokeStyle = 'rgba(20,0,10,0.45)'; ctx.lineWidth = 1.2;
      for (var i = -12; i < 12; i += 4) { ctx.beginPath(); ctx.moveTo(i, seated ? -30 : -30); ctx.lineTo(i, seated ? -8 : -8); ctx.stroke(); }
    }
    if (look.flowers) {
      ctx.fillStyle = '#e8e4dc';
      for (var n = 0; n < 5; n++) { ctx.beginPath(); ctx.arc(-6 + (n % 3) * 6, -24 + Math.floor(n / 3) * 8, 2.1, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.fillStyle = look.shirt2 || look.shirt || '#111';
    ctx.fillRect(-6, seated ? -28 : -36, 12, seated ? 8 : 8);
    ctx.save(); ctx.translate(-15, seated ? -20 : -28); ctx.rotate(swingB * 0.01);
    ctx.fillStyle = skin; ctx.fillRect(-3, 0, 6, 20); ctx.beginPath(); ctx.arc(0, 22, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(15, seated ? -20 : -28); ctx.rotate(swing * 0.01);
    ctx.fillStyle = skin; ctx.fillRect(-3, 0, 6, 20); ctx.beginPath(); ctx.arc(0, 22, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(0, -48, 13, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skinD; ctx.beginPath(); ctx.ellipse(0, -42, 8, 5, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(-5, -50, 1.6, 2.2, 0, 0, Math.PI * 2); ctx.ellipse(5, -50, 1.6, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    if (look.shades) {
      ctx.fillStyle = '#111'; ctx.fillRect(-9, -53, 18, 5); ctx.fillRect(-2, -52, 4, 3);
    }
    if (look.mustache) {
      ctx.fillStyle = '#4a2a18'; ctx.fillRect(-6, -45, 12, 3);
    }
    if (look.beard) {
      ctx.fillStyle = '#5a3418'; ctx.beginPath(); ctx.ellipse(0, -38, 8, 6, 0, 0, Math.PI); ctx.fill();
    }
    ctx.fillStyle = look.hair || '#3a2418';
    ctx.beginPath(); ctx.ellipse(0, -58, 14, 8, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-12, -50, 4, 8, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -50, 4, 8, -0.2, 0, Math.PI * 2); ctx.fill();
    if (look.flatCap) {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.ellipse(0, -62, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-4, -64, 20, 4);
    }
    if (look.backCap) {
      ctx.fillStyle = look.cap || '#6a2030';
      ctx.beginPath(); ctx.ellipse(0, -62, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-18, -62, 10, 5);
    }
    ctx.restore();
    if (!look.noLabel && look.name) {
      ctx.fillStyle = '#ff9ae0'; ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(look.name, x, y + 16); ctx.textAlign = 'left';
    }
  }
  var ZAKK = { name: 'ZAKK', shirt: '#1a1a1a', shirt2: '#111', pant: '#1c1c24', shoe: '#111', hair: '#2a1a12', flatCap: true, mustache: true, skin: '#e0b898' };
  var TAYLER = { name: 'TAYLER', shirt: '#7a2840', pant: '#2a3a58', shoe: '#5a3020', hair: '#3a2014', backCap: true, cap: '#6a2030', plaid: true, skin: '#e8c4a0' };
  function wrap() {
    var W = global.MothershipWorld;
    if (!W) return;
    W.drawZakk = function (ctx, x, y, facing, moving, t, opts) {
      opts = opts || {};
      var look = {};
      for (var k in ZAKK) look[k] = ZAKK[k];
      look.seated = !!opts.seated; look.noLabel = !!opts.noLabel;
      goAvatar(ctx, x, y, facing, moving, t, look);
    };
    W.drawTayler = function (ctx, x, y, facing, moving, t, opts) {
      opts = opts || {};
      var look = {};
      for (var k in TAYLER) look[k] = TAYLER[k];
      look.seated = !!opts.seated; look.noLabel = !!opts.noLabel;
      goAvatar(ctx, x, y, facing, moving, t, look);
    };
  }
  wrap();
  document.addEventListener('DOMContentLoaded', wrap);
  setTimeout(wrap, 0);
  setTimeout(wrap, 300);
})(window);
