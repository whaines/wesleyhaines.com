/* wesleyhaines.com — small progressive enhancements. The page works without this file. */
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]static\b/.test(location.search)) {   // preview/screenshot mode: everything at rest, images eager
    reduceMotion = true;
    root.classList.remove('js');
    document.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
  }
  var on = function (flag) { return !reduceMotion && root.classList.contains('m-' + flag); };
  var raf = window.requestAnimationFrame.bind(window);

  /* ---------- Light / dark (7: the new theme dissolves in slowly) ---------- */
  function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!on('wipe') || !document.startViewTransition) { setTheme(next); return; }
    var go = function () {
      root.classList.add('theme-dissolve');
      var t = document.startViewTransition(function () { setTheme(next); });
      t.finished.finally(function () { root.classList.remove('theme-dissolve', 'dusk'); });
    };
    if (next === 'dark' && on('dusk')) { root.classList.add('dusk'); setTimeout(go, 480); } else go();
  });

  /* ---------- "View All" project menu ---------- */
  document.querySelectorAll('[data-viewall]').forEach(function (el) {
    var btn = el.querySelector('button');
    var timer;
    function close() { el.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      el.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      clearTimeout(timer);
      timer = setTimeout(close, 4000);
    });
    el.addEventListener('mouseenter', function () { clearTimeout(timer); });
    el.addEventListener('mouseleave', function () { if (el.classList.contains('is-open')) timer = setTimeout(close, 1200); });
    document.addEventListener('click', function (e) { if (!el.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });

  /* ---------- Scroll-in animations (gallery cards stagger in reading order) ---------- */
  var appear = document.querySelectorAll('[data-appear]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      var cards = entries.filter(function (en) { return en.isIntersecting && en.target.classList.contains('gcard'); })
        .map(function (en) { return en.target; })
        .sort(function (a, b) { var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return (ra.top - rb.top) || (ra.left - rb.left); });
      var base = root.classList.contains('first-visit') && !window.__firstDone ? 1.8 : 0;
      cards.forEach(function (el, k) { el.style.setProperty('--appear-delay', (base + k * 0.12) + 's'); });
      if (cards.length) window.__firstDone = true;
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    appear.forEach(function (el) { io.observe(el); });
  } else {
    appear.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 1–2: remember which card was opened, for the page transition ---------- */
  document.addEventListener('click', function (e) {
    var card = e.target.closest('a.gcard');
    if (!card || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    document.querySelectorAll('.gcard.vt-active').forEach(function (c) { c.classList.remove('vt-active'); });
    card.classList.add('vt-active');
    try { sessionStorage.setItem('vtTo', card.getAttribute('href')); } catch (err) {}
  });
  window.addEventListener('pageshow', function () {   // back/forward cache: clear the old marker
    setTimeout(function () { document.querySelectorAll('.gcard.vt-active').forEach(function (c) { c.classList.remove('vt-active'); }); }, 900);
  });

  /* ---------- "Hello world" typewriter (8: the visitor's own language first) ---------- */
  var HELLOS = [
    'Hello\nworld', 'Bonjour\nle monde', 'Hola\nMundo', 'Hallo\nWelt', 'Ciao\nMondo', 'こんにちは\n世界', '你好\n世界',
    '안녕하세요\n세계', 'नमस्ते\nदुनिया', 'Olá\nMundo', 'হ্যালো\nবিশ্ব', 'Привет\nмир', 'Merhaba\nDünya', 'Xin chào\nThế giới', 'Hej\nvärlden'
  ];
  var LANG = { fr: 1, es: 2, de: 3, it: 4, ja: 5, zh: 6, ko: 7, hi: 8, pt: 9, bn: 10, ru: 11, tr: 12, vi: 13, sv: 14 };
  var first = 0;
  if (on('hello')) {
    var langs = navigator.languages || [navigator.language || 'en'];
    for (var li = 0; li < langs.length; li++) { var code = String(langs[li]).slice(0, 2).toLowerCase(); if (code === 'en') break; if (LANG[code]) { first = LANG[code]; break; } }
  }
  var shuffled = HELLOS.map(function (s, k) { return k; }).filter(function (k) { return k !== first; }).sort(function () { return Math.random() - 0.5; });
  document.querySelectorAll('[data-typewriter]').forEach(function (el) {
    var twoLines = el.hasAttribute('data-two-lines');
    var list = HELLOS.map(function (s) { return twoLines ? s : s.replace('\n', ' '); });
    var out = el.querySelector('[data-typewriter-text]') || el;
    if (reduceMotion) { out.textContent = list[0]; return; }
    var order = [list[first]].concat(shuffled.map(function (k) { return list[k]; }));
    var i = 0, n = 0, deleting = false;
    function tick() {
      var word = order[i];
      if (!deleting) {
        n++;
        if (n > word.length) { deleting = true; setTimeout(tick, 2000); return; }
      } else {
        n--;
        if (n < 0) { deleting = false; n = 0; i = (i + 1) % order.length; }
      }
      out.textContent = word.slice(0, n);
      setTimeout(tick, deleting ? 50 : 100);
    }
    out.textContent = '';
    setTimeout(tick, root.classList.contains('first-visit') ? 1400 : 400);
  });

  /* ---------- Letter-by-letter reveal ---------- */
  document.querySelectorAll('[data-letters]').forEach(function (el) {
    if (reduceMotion) return;
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split('').forEach(function (ch, k) {
      var s = document.createElement('span');
      s.className = 'letter';
      s.setAttribute('aria-hidden', 'true');
      s.style.animationDelay = (0.1 + k * 0.05) + 's';
      s.textContent = ch;
      el.appendChild(s);
    });
  });

  if (reduceMotion) return;

  /* ---------- 4: mockups float slightly behind their cards ---------- */
  var floaters = [].slice.call(document.querySelectorAll('.cs-hero img, .gcard__img'));
  var pending = false;
  function float() {
    pending = false;
    var par = on('parallax'), shadow = on('shadow');
    if (!par && !shadow) return;
    var vw = innerWidth, vh = innerHeight;
    floaters.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200 || r.right < -200 || r.left > vw + 200) return;
      var cy = r.top + r.height / 2 - vh / 2, cx = r.left + r.width / 2 - vw / 2;
      if (par) {
        el.style.setProperty('--py', (-cy * 0.05).toFixed(1) + 'px');
        el.style.setProperty('--px', (-cx * 0.04).toFixed(1) + 'px');
      }
      if (shadow && el.parentElement.classList.contains('cs-hero')) {
        el.parentElement.style.setProperty('--lift', Math.max(-1, Math.min(1, -cy / (vh * 0.6))).toFixed(3));
      }
    });
  }
  function onScrollFloat() { if (!pending) { pending = true; raf(float); } }

  /* ---------- 10: mockups sway inside their cards as you scroll ---------- */
  // Scroll velocity feeds a target; each frame the sway eases toward it and the target decays,
  // so the lean builds gently with speed and floats back to rest after the scroll stops.
  var MAX_LEAN = 1.5, MAX_LAG = 6;
  var sway = new Map();           // gallery -> { pos, t, target, lean, running, horizontal }
  function lean(scroller, gallery, pos, horizontal) {
    if (!on('lean') || !gallery) return;
    var now = performance.now(), s = sway.get(gallery);
    if (!s) { s = { pos: pos, t: now, target: 0, lean: 0, running: false }; sway.set(gallery, s); }
    var v = (pos - s.pos) / Math.max(now - s.t, 8);                   // px per ms, signed
    s.target = Math.max(-1, Math.min(1, s.target * 0.5 + v * 0.35));  // -1..1, smoothed across events
    s.pos = pos; s.t = now; s.horizontal = horizontal;
    if (!s.running) { s.running = true; raf(function frame() { step(gallery, s, frame); }); }
  }
  function step(gallery, s, frame) {
    s.lean += (s.target - s.lean) * 0.12;       // ease toward the target
    s.target *= 0.9;                            // and let the target fade back to rest
    var deg = s.lean * MAX_LEAN, lag = -s.lean * MAX_LAG;
    gallery.style.setProperty('--lean', deg.toFixed(3) + 'deg');
    gallery.style.setProperty('--lag-x', (s.horizontal ? lag : 0).toFixed(2) + 'px');
    gallery.style.setProperty('--lag-y', (s.horizontal ? 0 : lag).toFixed(2) + 'px');
    if (Math.abs(s.lean) < 0.002 && Math.abs(s.target) < 0.002) {
      s.running = false;
      gallery.style.setProperty('--lean', '0deg'); gallery.style.setProperty('--lag-x', '0px'); gallery.style.setProperty('--lag-y', '0px');
      return;
    }
    raf(frame);
  }

  document.addEventListener('scroll', function (e) {
    onScrollFloat();
    var t = e.target;
    if (t === document) {
      var g = document.querySelector('.gallery');
      if (g && g.scrollHeight <= g.clientHeight + 1 && g.scrollWidth <= g.clientWidth + 1) lean(window, g, scrollY, false);
    } else if (t.classList && t.classList.contains('gallery')) {
      var h = t.scrollWidth > t.clientWidth + 1; lean(t, t, h ? t.scrollLeft : t.scrollTop, h);
    }
  }, { capture: true, passive: true });
  addEventListener('resize', onScrollFloat);
  float();

  /* ---------- Lab 2 · 3: the framing question arrives word by word ---------- */
  if (on('words')) {
    document.querySelectorAll('.cs-header__question').forEach(function (q) {
      var text = q.textContent;
      q.setAttribute('aria-label', text);
      q.textContent = '';
      text.split(/(\s+)/).forEach(function (part, k) {
        if (/^\s+$/.test(part)) { q.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span');
        w.className = 'w'; w.setAttribute('aria-hidden', 'true');
        w.style.animationDelay = (0.35 + (k / 2) * 0.045).toFixed(3) + 's';
        w.textContent = part;
        q.appendChild(w);
      });
    });
  }

  /* ---------- Lab 2 · 7: case-study chapters — hero first, then its cards ---------- */
  if (on('chapters') && matchMedia('(min-width: 1280px)').matches) {
    document.querySelectorAll('.cs-group').forEach(function (g) {
      var hero = g.querySelector('.cs-hero');
      if (hero) hero.style.setProperty('--appear-delay', '0s');
      g.querySelectorAll('.cs-card').forEach(function (c, k) { c.style.setProperty('--appear-delay', (0.22 + k * 0.2) + 's'); });
    });
  }

  /* ---------- Lab 2 · 4 and 8: tint deepens through the body; next project's tint rises near the end ---------- */
  var body = document.querySelector('.cs-body'), footer = document.querySelector('.cs-footer');
  var nextCard = document.querySelector('.next__card--next'), bleed = null;
  if (on('bleed') && nextCard && footer) {
    bleed = document.createElement('div');
    bleed.className = 'next-bleed'; bleed.setAttribute('aria-hidden', 'true');
    bleed.style.setProperty('--bleed-tint', nextCard.style.getPropertyValue('--card-tint'));
    document.body.appendChild(bleed);
  }
  var tintPending = false;
  function tint() {
    tintPending = false;
    var vh = innerHeight;
    if (on('tint') && body) {
      var r = body.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh - r.top) / (r.height + vh)));
      document.body.style.setProperty('--tint-boost', Math.sin(Math.PI * p).toFixed(3));
    }
    if (bleed) {
      var f = footer.getBoundingClientRect();
      var o = Math.max(0, Math.min(1, (vh - f.top + 120) / (vh * 0.7)));
      bleed.style.setProperty('--bleed-o', (o * 0.9).toFixed(3));
    }
  }
  if (body || bleed) {
    addEventListener('scroll', function () { if (!tintPending) { tintPending = true; raf(tint); } }, { passive: true });
    tint();
  }

  /* ---------- Lab 2 · 11: Read.me photos develop like film ---------- */
  if (on('develop') && 'IntersectionObserver' in window) {
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('developed'); dio.unobserve(en.target); } });
    }, { threshold: 0.3 });
    document.querySelectorAll('.photo').forEach(function (p) { dio.observe(p); });
  }

})();

/* ---------- First visit is remembered after this page ---------- */
try { localStorage.setItem('visited', '1'); } catch (e) {}

/* ---------- Motion Lab 2: ?lab shows a panel to switch each study on and off ---------- */
(function () {
  var FLAGS = [
    ['tblur', 'Titles resolve from a blur'], ['italic', 'Titles settle into italic'], ['words', 'Question arrives word by word'],
    ['tint', 'Tint deepens through the page'], ['shadow', 'Soft shadow under mockups'], ['sheen', 'Sheen across glass controls'],
    ['chapters', 'Hero first, then its cards'], ['bleed', 'Next project’s tint rises'], ['snap', 'Gallery settles on a card'],
    ['first', 'First-visit pause'], ['develop', 'Read.me photos develop'], ['dusk', 'Aura dims before going dark']
  ];
  var store = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} };
  if (/[?&]lab\b/.test(location.search)) store('motion-lab', '1');
  if (store('motion-lab') !== '1') return;
  var off = [];
  try { off = JSON.parse(store('motion-lab-off') || '[]'); } catch (e) {}
  var panel = document.createElement('aside');
  panel.className = 'lab';
  panel.setAttribute('aria-label', 'Motion Lab');
  panel.innerHTML = '<h2>Motion Lab 2</h2>' + FLAGS.map(function (f) {
    return '<label><input type="checkbox" id="lab-' + f[0] + '" data-flag="' + f[0] + '"' + (off.indexOf(f[0]) < 0 ? ' checked' : '') + '> ' + f[1] + '</label>';
  }).join('') + '<p>Entrances show on the next page load. The first-visit pause replays after you reset it.</p>'
    + '<button type="button" data-lab-reset>Reset first visit</button><br><button type="button" data-lab-close>Hide this panel</button>';
  document.body.appendChild(panel);
  panel.addEventListener('change', function (e) {
    var f = e.target.getAttribute('data-flag');
    off = off.filter(function (x) { return x !== f; });
    if (!e.target.checked) off.push(f);
    store('motion-lab-off', JSON.stringify(off));
    document.documentElement.classList.toggle('m-' + f, e.target.checked);
  });
  panel.querySelector('[data-lab-reset]').addEventListener('click', function () { store('visited', null); location.reload(); });
  panel.querySelector('[data-lab-close]').addEventListener('click', function () { store('motion-lab', null); panel.remove(); });
})();
