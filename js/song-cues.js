/**
 * Wire Retrofit — Mothership lyric beats into HUD / liners / stereo LCD.
 */
(function (global) {
  const LCD_LINES = [
    '\u25b6 MOTHERSHIP',
    "GETTING HIGH IN MOM'S SHED",
    'OUT BACK LANDS A MOTHERSHIP',
    "I KNOW THAT I AIN'T TRIPPING",
    'THROWN IN THE BACK',
    "MOUTHS AIN'T MOVING",
    "I THINK THEY'RE TELEPATHIC",
    "DRIVER'S SEAT",
    'STREETS BENEATH',
    'WAIT — I KNOW HIM',
    'BEAM HIM UP',
    "SEE WHAT HE'S BEEN EATIN'",
    'KFC + MICROPLASTICS',
    'HIGH IN THE MOTHERSHIP',
    "MIND I'VE COMPLETELY SHED",
    "A NIGHT I'M GONNA FORGET"
  ];

  const SONG_ONE = [
    'Wait a minute — I know him.',
    "Beam him up. Show him who he shouldn't have.",
    "Let's open him up and see what he's been eatin'.",
    'Kentucky Fried Chicken. And a bunch of microplastics.',
    "They speak a different language. Mouths aren't moving.",
    "Getting high in the mothership. Mind I've completely shed."
  ];
  const SONG_RESULTS = [
    "This is a night I know that I'm gonna forget.",
    "Getting high in our mother's shed. Then the ship landed.",
    'Back in the cooler — KFC and microplastics. Peak Chilliwack.'
  ];
  const SONG_SHED = [
    "Getting high in our mother's shed.",
    'When out back lands a mothership.',
    "I know what I'm seeing. I know that I ain't tripping."
  ];

  function patchWorld() {
    const W = global.MothershipWorld;
    if (!W || W._songCues) return;
    W._songCues = true;
    function front(arr, extras) {
      if (!arr || !arr.unshift) return;
      extras.slice().reverse().forEach(function (s) { arr.unshift(s); });
    }
    front(W.ONE_LINERS, SONG_ONE);
    front(W.RESULTS_LINERS, SONG_RESULTS);
    front(W.SHED_GAGS, SONG_SHED);
    front(W.PLASTICS_LINERS, ['A bunch of microplastics.']);
    front(W.CHICKEN_LINERS, ["Kentucky Fried Chicken. Fuel's good."]);
    if (W.PEOPLE_KINDS && !W.PEOPLE_KINDS.some(function (k) { return k.id === 'knownboy'; })) {
      W.PEOPLE_KINDS.unshift({
        id: 'knownboy',
        label: 'That Kid',
        points: 260,
        color: '#ff66cc',
        human: true,
        look: 'graphic',
        known: true
      });
    }
  }

  function startLcdCycle() {
    const display = document.getElementById('stereo-display');
    if (!display || display._lyricTimer) return;
    var i = 0;
    function tick() {
      const stereo = document.getElementById('car-stereo');
      if (!stereo || !stereo.classList.contains('playing')) return;
      const lcd = display.querySelector('.stereo-lcd');
      if (lcd) lcd.textContent = LCD_LINES[i % LCD_LINES.length];
      i++;
    }
    display._lyricTimer = setInterval(tick, 2800);
    tick();
  }

  function watchOperateCopy() {
    const panel = document.querySelector('.operate-panel');
    if (!panel || panel._songHooked) return;
    panel._songHooked = true;
    const h2 = panel.querySelector('h2');
    const lines = panel.querySelectorAll('p');
    if (h2) h2.textContent = 'OPEN HIM UP';
    if (lines[0]) lines[0].innerHTML = 'Findings: <strong>KFC</strong> & <strong>microplastics</strong>.';
    if (lines[1]) lines[1].textContent = 'Wait a minute — I know him.';
  }

  function watchMode() {
    const mode = document.getElementById('mode-label');
    if (!mode || mode._songObs) return;
    const obs = new MutationObserver(function () {
      const t = (mode.textContent || '').trim();
      if (t === 'OPERATE') watchOperateCopy();
      if (t === 'SHED' || t === 'YARD') startLcdCycle();
    });
    obs.observe(mode, { childList: true, characterData: true, subtree: true });
    mode._songObs = obs;
  }

  function boot() {
    patchWorld();
    watchMode();
    const stereo = document.getElementById('car-stereo');
    if (stereo) {
      const obs = new MutationObserver(function () {
        if (stereo.classList.contains('playing')) startLcdCycle();
      });
      obs.observe(stereo, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
