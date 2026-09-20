(function (global) {
  var KIND = 'sossys';
  var WORLD_X = 5750;
  function drawSign(ctx, cx, top, w) {
    ctx.fillStyle = '#d8dde4'; ctx.fillRect(cx - w / 2, top, w, 22);
    ctx.fillStyle = '#2a2a32'; ctx.fillRect(cx - w / 2 + 2, top + 2, w - 4, 18);
    ctx.fillStyle = '#f2efe6'; ctx.font = 'bold 11px Times New Roman, serif'; ctx.textAlign = 'center';
    ctx.fillText("SOSSY'S", cx - 28, top + 16);
    ctx.fillStyle = '#e8c44a'; ctx.fillText('X', cx, top + 16);
    ctx.fillStyle = '#f2efe6'; ctx.fillText('SALOON', cx + 32, top + 16); ctx.textAlign = 'left';
  }
  function drawExterior(ctx, x, groundY, label) {
    var w = 168, h = 92;
    ctx.save();
    ctx.fillStyle = '#e8e4dc'; ctx.fillRect(x, groundY - h, w, h);
    ctx.fillStyle = 'rgba(180,170,160,0.35)';
    for (var row = 0; row < 12; row++) {
      var oy = groundY - h + 6 + row * 7;
      for (var col = 0; col < 14; col++) ctx.fillRect(x + 4 + col * 12 + (row % 2) * 6, oy, 10, 2);
    }
    ctx.fillStyle = '#3a3a42'; ctx.fillRect(x - 4, groundY - h - 8, w + 8, 10);
    drawSign(ctx, x + w / 2, groundY - h - 30, 150);
    ctx.fillStyle = 'rgba(80,200,255,0.35)'; ctx.fillRect(x + 18, groundY - h - 8, w - 36, 3);
    function win(wx, wy, ww, hh) {
      ctx.fillStyle = '#1a1410'; ctx.fillRect(wx, wy, ww, hh);
      ctx.strokeStyle = '#c8c4bc'; ctx.lineWidth = 2; ctx.strokeRect(wx, wy, ww, hh);
      ctx.fillStyle = 'rgba(255,180,80,0.18)'; ctx.fillRect(wx + 2, wy + 2, ww - 4, hh - 4);
    }
    win(x + 8, groundY - 78, 36, 28); win(x + 124, groundY - 78, 36, 28);
    ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x + 58, groundY - 62, 52, 62);
    ctx.fillStyle = '#6a4a28'; ctx.fillRect(x + 61, groundY - 58, 22, 54); ctx.fillRect(x + 85, groundY - 58, 22, 54);
    ctx.strokeStyle = '#c4a06a'; ctx.lineWidth = 2;
    ctx.strokeRect(x + 61, groundY - 58, 22, 54); ctx.strokeRect(x + 85, groundY - 58, 22, 54);
    ctx.fillStyle = '#1a1a22'; ctx.fillRect(x + 10, groundY - 16, 28, 8);
    ctx.beginPath(); ctx.arc(x + 16, groundY - 4, 6, 0, Math.PI * 2); ctx.arc(x + 34, groundY - 4, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#224488'; ctx.fillRect(x + 128, groundY - 16, 30, 8);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + 134, groundY - 4, 6, 0, Math.PI * 2); ctx.arc(x + 152, groundY - 4, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x + 28, groundY + 6, 112, 12);
    ctx.fillStyle = '#ffe8a0'; ctx.font = 'bold 8px Segoe UI, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label || "SOSSY'S · AGASSIZ", x + w / 2, groundY + 15); ctx.textAlign = 'left'; ctx.restore();
  }
  function drawKurtis(ctx, x, y, facing, pose) {
    ctx.save(); ctx.translate(x, y); ctx.scale(facing < 0 ? -1 : 1, 1);
    ctx.fillStyle = '#2a1a14'; ctx.fillRect(-10, -38, 20, 28);
    ctx.fillStyle = '#c4a06a'; ctx.fillRect(-9, -28, 18, 8);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-8, -10, 7, 10); ctx.fillRect(2, -10, 7, 10);
    ctx.fillStyle = '#e0b898'; ctx.beginPath(); ctx.arc(0, -48, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.ellipse(0, -54, 10, 7, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#5a3020'; ctx.fillRect(-6, -44, 12, 3);
    if (pose === 'piano') { ctx.fillStyle = '#e0b898'; ctx.fillRect(-18, -30, 8, 4); ctx.fillRect(10, -30, 8, 4); }
    else {
      ctx.strokeStyle = '#c44'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(14, -36); ctx.lineTo(14, -22); ctx.stroke();
      ctx.fillStyle = '#8a1028'; ctx.beginPath(); ctx.moveTo(10, -36); ctx.lineTo(18, -36); ctx.lineTo(16, -28); ctx.lineTo(12, -28); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#f4e8c8'; ctx.font = 'bold 8px Segoe UI, sans-serif'; ctx.textAlign = 'center';
    ctx.scale(facing < 0 ? -1 : 1, 1); ctx.fillText('KURTIS (NOT) HALL', 0, 12); ctx.restore();
  }
  function drawTaylorSwift(ctx, x, y, t) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#d4a0c8'; ctx.beginPath(); ctx.moveTo(-12, -8); ctx.lineTo(12, -8); ctx.lineTo(16, 2); ctx.lineTo(-16, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0d890'; ctx.fillRect(-9, -28, 18, 22);
    ctx.fillStyle = '#f4d890'; ctx.beginPath(); ctx.arc(0, -36, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8c44a'; ctx.beginPath(); ctx.ellipse(0, -40, 10, 8, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c03040'; ctx.fillRect(-3, -32, 6, 2);
    ctx.fillStyle = '#fff8e8'; ctx.font = 'bold 8px Segoe UI, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TAYLOR', 0, 14); ctx.restore();
  }
  function drawPatron(ctx, x, y, seed, t) {
    var bob = Math.sin(t * 0.004 + seed) * 2;
    ctx.fillStyle = seed % 2 ? '#4a3040' : '#2a3848'; ctx.fillRect(x - 6, y - 28 + bob, 12, 20);
    ctx.fillStyle = '#e0b898'; ctx.beginPath(); ctx.arc(x, y - 32 + bob, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 5, y - 8 + bob, 4, 8); ctx.fillRect(x + 1, y - 8 + bob, 4, 8);
  }
  function drawInterior(ctx, w, h, camX, t) {
    var groundY = h * 0.72;
    var wall = ctx.createLinearGradient(0, 0, 0, groundY);
    wall.addColorStop(0, '#3a2418'); wall.addColorStop(1, '#241610');
    ctx.fillStyle = wall; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(0, groundY, w, h - groundY);
    var lamp = ctx.createRadialGradient(w * 0.35, 80, 10, w * 0.35, 80, 220);
    lamp.addColorStop(0, 'rgba(255,160,60,0.28)'); lamp.addColorStop(1, 'rgba(255,160,60,0)');
    ctx.fillStyle = lamp; ctx.fillRect(0, 0, w, h);
    var barX = 700 - camX;
    ctx.fillStyle = '#1a1010'; ctx.fillRect(barX, groundY - 70, 220, 70);
    ctx.fillStyle = '#6a3a22'; ctx.fillRect(barX, groundY - 18, 220, 18);
    ctx.fillStyle = '#c44'; for (var i = 0; i < 8; i++) ctx.fillRect(barX + 16 + i * 24, groundY - 58, 6, 16);
    ctx.fillStyle = '#e8c44a'; ctx.font = 'bold 10px serif'; ctx.fillText("SOSSY'S", barX + 70, groundY - 78);
    var doorX = 160 - camX;
    ctx.fillStyle = '#6a4a28'; ctx.fillRect(doorX, groundY - 64, 22, 50); ctx.fillRect(doorX + 26, groundY - 64, 22, 50);
    for (var j = 0; j < 7; j++) drawPatron(ctx, 240 + j * 48 - camX, groundY, j * 17, t);
    var px = 560 - camX, py = groundY;
    ctx.fillStyle = '#1a1a1c'; ctx.fillRect(px - 36, py - 28, 78, 18); ctx.fillRect(px - 30, py - 22, 8, 22); ctx.fillRect(px + 28, py - 22, 8, 22);
    ctx.fillStyle = '#f4efe6'; ctx.fillRect(px - 28, py - 26, 62, 8);
    ctx.fillStyle = '#e8c070'; ctx.font = 'bold 8px Segoe UI, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('PIANO', px + 4, py + 14);
    var tx = 820 - camX;
    ctx.fillStyle = '#4a2a1a'; ctx.fillRect(tx - 28, py - 16, 70, 12);
    ctx.fillStyle = '#8a1028'; ctx.fillText('PINOT', tx + 8, py + 14); ctx.textAlign = 'left';
    var mode = (global.MothershipWorld && MothershipWorld._sossysKurtis) || 'piano';
    if (mode === 'wine') { drawKurtis(ctx, tx - 6, py, 1, 'wine'); drawTaylorSwift(ctx, tx + 22, py, t); }
    else { drawKurtis(ctx, px + 4, py - 8, 1, 'piano'); drawTaylorSwift(ctx, tx + 10, py, t); }
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(w / 2 - 210, 18, 420, 36);
    ctx.fillStyle = '#f4e8c8'; ctx.font = 'bold 13px Segoe UI, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText("SOSSY'S SALOON  ·  AGASSIZ", w / 2, 34);
    ctx.font = '11px Segoe UI, sans-serif'; ctx.fillStyle = '#e8c070';
    ctx.fillText(mode === 'wine' ? 'Kurtis (Not) Hall drinks Pinot with Taylor. That is it.' : 'Kurtis (Not) Hall — piano only. Or the Pinot.', w / 2, 48);
    ctx.textAlign = 'left';
  }
  function injectProp(fly) {
    if (!fly || !fly.props) return;
    if (!fly.props.some(function (p) { return p.kind === KIND; })) {
      fly.props.push({ x: WORLD_X, kind: KIND, label: "SOSSY'S SALOON", landmark: true });
    }
  }
  var st = { inside: false, playingKurtis: false, cam: 200, lastFly: null };
  function nearSaloon(fly) {
    if (!fly) return false;
    var worldX = (fly.scrollX || 0) + (fly.ufoX || 0);
    var low = (fly.ufoY || 0) >= 250 || (fly.legExtend || 0) >= 0.4;
    return low && Math.abs(worldX - WORLD_X) < 80;
  }
  function wrap() {
    var W = global.MothershipWorld;
    if (!W || W._sossysWrapped) return;
    W._sossysWrapped = true;
    W._sossysKurtis = W._sossysKurtis || 'piano';
    var origFly = W.drawFlyScene;
    if (typeof origFly === 'function') {
      W.drawFlyScene = function (ctx, w, h, fly, t) {
        st.lastFly = fly; injectProp(fly);
        if (st.inside) {
          if (fly) { fly.vx = 0; fly.vy = 0; }
          drawInterior(ctx, w, h, st.cam, t);
          ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(w / 2 - 230, h - 46, 460, 32);
          ctx.fillStyle = '#f4e8c8'; ctx.font = 'bold 12px Segoe UI, sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(st.playingKurtis ? 'Left piano   Right Pinot + Taylor   E drop   L leave' : 'E play as Kurtis (piano or wine only)   L take off', w / 2, h - 26);
          ctx.textAlign = 'left'; return;
        }
        var r = origFly.apply(this, arguments);
        try {
          var groundY = h * 0.78, scrollX = (fly && fly.scrollX) || 0, px = WORLD_X - scrollX;
          if (px > -180 && px < w + 40) {
            drawExterior(ctx, px, groundY, "SOSSY'S SALOON");
            if (nearSaloon(fly)) {
              ctx.fillStyle = '#ffe8a0'; ctx.font = 'bold 14px Segoe UI, sans-serif'; ctx.textAlign = 'center';
              ctx.fillText("L  LAND — SOSSY'S SALOON", px + 84, groundY - 118); ctx.textAlign = 'left';
            }
          }
        } catch (err) {}
        return r;
      };
    }
    var origIn = W.drawLandmarkInterior;
    if (typeof origIn === 'function') {
      W.drawLandmarkInterior = function (ctx, w, h, camX, t, opts) {
        opts = opts || {};
        if (opts.kind === KIND) { drawInterior(ctx, w, h, camX, t); return; }
        return origIn.apply(this, arguments);
      };
    }
    window.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase(); var fly = st.lastFly;
      if (!st.inside) {
        if (k === 'l' && nearSaloon(fly)) { st.inside = true; st.playingKurtis = false; W._sossysKurtis = 'piano'; e.preventDefault(); }
        return;
      }
      if (k === 'l' || k === 'escape') { st.inside = false; st.playingKurtis = false; e.preventDefault(); return; }
      if (k === 'e') { st.playingKurtis = !st.playingKurtis; e.preventDefault(); return; }
      if (!st.playingKurtis) return;
      if (k === 'arrowleft' || k === 'a') { W._sossysKurtis = 'piano'; e.preventDefault(); }
      else if (k === 'arrowright' || k === 'd') { W._sossysKurtis = 'wine'; e.preventDefault(); }
    }, true);
  }
  if (global.MothershipWorld) wrap();
  else document.addEventListener('DOMContentLoaded', wrap);
})(window);
