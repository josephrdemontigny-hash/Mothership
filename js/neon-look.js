/**
 * Neon-noir grade so scenes match the trading-card portraits:
 * wet night street, magenta/cyan rim, comic contrast, wet-ground specular.
 */
(function (global) {
  function wetSpecular(ctx, w, h, t) {
    // Long vertical neon reflections on the lower third (wet asphalt feel)
    var ground = h * 0.68;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var seed = ((t || 0) / 90) | 0;
    for (var i = 0; i < 14; i++) {
      var x = ((i * 73 + seed * 17) % (w + 40)) - 20;
      var mag = i % 3 === 0;
      var col = mag ? 'rgba(255, 58, 214,' : 'rgba(61, 240, 255,';
      var a0 = 0.14 + (i % 4) * 0.02;
      var grad = ctx.createLinearGradient(x, ground, x, h);
      grad.addColorStop(0, col + a0 + ')');
      grad.addColorStop(0.55, col + (a0 * 0.45) + ')');
      grad.addColorStop(1, col + '0)');
      ctx.fillStyle = grad;
      var tw = 3 + (i % 5);
      ctx.fillRect(x, ground, tw, h - ground);
    }
    // Warm lamp pools on wet ground
    var lamp = ctx.createRadialGradient(w * 0.28, h * 0.82, 4, w * 0.28, h * 0.88, w * 0.22);
    lamp.addColorStop(0, 'rgba(255, 170, 70, 0.16)');
    lamp.addColorStop(1, 'rgba(255, 170, 70, 0)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, ground, w, h - ground);
    ctx.restore();
  }

  function neonGrade(ctx, w, h, t) {
    ctx.save();
    // Magenta→cyan wash (stronger dusk/night)
    var wash = ctx.createLinearGradient(0, 0, w, h);
    wash.addColorStop(0, 'rgba(255, 40, 170, 0.2)');
    wash.addColorStop(0.4, 'rgba(20, 10, 48, 0.08)');
    wash.addColorStop(1, 'rgba(30, 160, 255, 0.2)');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);

    // Cool upper night wash
    ctx.globalCompositeOperation = 'multiply';
    var night = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    night.addColorStop(0, 'rgba(40, 20, 90, 0.55)');
    night.addColorStop(0.7, 'rgba(255,255,255,1)');
    night.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = night;
    ctx.fillRect(0, 0, w, h * 0.55);

    ctx.globalCompositeOperation = 'screen';
    var lamp = ctx.createRadialGradient(w * 0.22, h * 0.16, 8, w * 0.22, h * 0.16, w * 0.4);
    lamp.addColorStop(0, 'rgba(255, 170, 70, 0.26)');
    lamp.addColorStop(1, 'rgba(255, 170, 70, 0)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, w, h);

    var neon = ctx.createRadialGradient(w * 0.78, h * 0.18, 6, w * 0.78, h * 0.2, w * 0.36);
    neon.addColorStop(0, 'rgba(80, 200, 255, 0.24)');
    neon.addColorStop(1, 'rgba(80, 200, 255, 0)');
    ctx.fillStyle = neon;
    ctx.fillRect(0, 0, w, h);

    // Magenta rim accent opposite cyan
    var mag = ctx.createRadialGradient(w * 0.12, h * 0.55, 4, w * 0.12, h * 0.55, w * 0.28);
    mag.addColorStop(0, 'rgba(255, 40, 180, 0.14)');
    mag.addColorStop(1, 'rgba(255, 40, 180, 0)');
    ctx.fillStyle = mag;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'multiply';
    var vig = ctx.createRadialGradient(w * 0.5, h * 0.48, h * 0.18, w * 0.5, h * 0.5, h * 0.82);
    vig.addColorStop(0, 'rgba(255,255,255,1)');
    vig.addColorStop(1, 'rgba(28, 12, 55, 0.78)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.045;
    var seed = ((t || 0) / 80) | 0;
    for (var i = 0; i < 60; i++) {
      var x = ((i * 97 + seed * 13) % w);
      var y = ((i * 53 + seed * 7) % h);
      ctx.fillStyle = i % 2 ? '#ffffff' : '#120814';
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    ctx.restore();

    wetSpecular(ctx, w, h, t);
  }

  function wrap() {
    var W = global.MothershipWorld;
    if (!W || W._neonWrapped) return;
    W._neonWrapped = true;
    [
      'drawShed',
      'drawYard',
      'drawFlyScene',
      'drawTitleBackdrop',
      'drawShipInterior',
      'drawStreetDriveScene',
      'drawLandmarkInterior',
    ].forEach(function (name) {
      var orig = W[name];
      if (typeof orig !== 'function') return;
      W[name] = function (ctx) {
        var r = orig.apply(this, arguments);
        try {
          var w = ctx.canvas ? ctx.canvas.width : 960;
          var h = ctx.canvas ? ctx.canvas.height : 540;
          var t = arguments[arguments.length - 1];
          neonGrade(ctx, w, h, typeof t === 'number' ? t : 0);
        } catch (e) {}
        return r;
      };
    });
  }

  if (global.MothershipWorld) wrap();
  else document.addEventListener('DOMContentLoaded', wrap);
})(window);
