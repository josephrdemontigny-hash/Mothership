/**
 * Neon-noir grade so scenes match the trading-card portraits:
 * wet night street, magenta/cyan rim, comic contrast.
 */
(function (global) {
  function neonGrade(ctx, w, h, t) {
    ctx.save();
    const wash = ctx.createLinearGradient(0, 0, w, h);
    wash.addColorStop(0, 'rgba(255, 40, 170, 0.16)');
    wash.addColorStop(0.45, 'rgba(20, 10, 40, 0.05)');
    wash.addColorStop(1, 'rgba(30, 160, 255, 0.16)');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'screen';
    const lamp = ctx.createRadialGradient(w * 0.22, h * 0.16, 8, w * 0.22, h * 0.16, w * 0.38);
    lamp.addColorStop(0, 'rgba(255, 170, 70, 0.22)');
    lamp.addColorStop(1, 'rgba(255, 170, 70, 0)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, w, h);

    const neon = ctx.createRadialGradient(w * 0.78, h * 0.2, 6, w * 0.78, h * 0.2, w * 0.34);
    neon.addColorStop(0, 'rgba(80, 200, 255, 0.2)');
    neon.addColorStop(1, 'rgba(80, 200, 255, 0)');
    ctx.fillStyle = neon;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'multiply';
    const vig = ctx.createRadialGradient(w * 0.5, h * 0.48, h * 0.2, w * 0.5, h * 0.5, h * 0.78);
    vig.addColorStop(0, 'rgba(255,255,255,1)');
    vig.addColorStop(1, 'rgba(40, 20, 70, 0.72)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.05;
    const seed = ((t || 0) / 80) | 0;
    for (let i = 0; i < 55; i++) {
      const x = ((i * 97 + seed * 13) % w);
      const y = ((i * 53 + seed * 7) % h);
      ctx.fillStyle = i % 2 ? '#ffffff' : '#120814';
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    ctx.restore();
  }

  function wrap() {
    const W = global.MothershipWorld;
    if (!W || W._neonWrapped) return;
    W._neonWrapped = true;
    ['drawShed', 'drawYard', 'drawFlyScene', 'drawTitleBackdrop', 'drawShipInterior', 'drawStreetDriveScene', 'drawLandmarkInterior'].forEach(function (name) {
      const orig = W[name];
      if (typeof orig !== 'function') return;
      W[name] = function (ctx) {
        const r = orig.apply(this, arguments);
        try {
          const w = ctx.canvas ? ctx.canvas.width : 960;
          const h = ctx.canvas ? ctx.canvas.height : 540;
          const t = arguments[arguments.length - 1];
          neonGrade(ctx, w, h, typeof t === 'number' ? t : 0);
        } catch (e) {}
        return r;
      };
    });
  }

  if (global.MothershipWorld) wrap();
  else document.addEventListener('DOMContentLoaded', wrap);
})(window);
