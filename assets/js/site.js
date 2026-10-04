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
      t.finished.finally(function () { root.classList.remove('theme-dissolve'); });
    };
    go();
  });

  /* ---------- "View All" project menu ---------- */
  document.querySelectorAll('[data-viewall]').forEach(function (el) {
    var btn = el.querySelector('button');
    var timer;
    // In flow (the CSS sets --viewall-flow), ease the box from one size to the other so the things beside it glide rather than jump.
    function toggle(open) {
      if (el.classList.contains('is-open') === open) return;
      var flow = getComputedStyle(el).getPropertyValue('--viewall-flow').trim() === '1';
      if (!flow || reduceMotion) { el.classList.toggle('is-open', open); return; }
      var a = el.getBoundingClientRect();
      el.style.transition = 'none'; el.style.width = ''; el.style.height = '';
      el.classList.toggle('is-open', open);
      el.classList.add('is-sizing');
      var b = el.getBoundingClientRect();
      el.style.width = a.width + 'px'; el.style.height = a.height + 'px';
      el.offsetWidth;
      el.style.transition = 'width .5s cubic-bezier(.22, 1, .36, 1), height .5s cubic-bezier(.22, 1, .36, 1)';
      el.style.width = b.width + 'px'; el.style.height = b.height + 'px';
      clearTimeout(el._sz);
      el._sz = setTimeout(function () { el.style.transition = el.style.width = el.style.height = ''; el.classList.remove('is-sizing'); }, 520);
    }
    function close() { toggle(false); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle(true);
      btn.setAttribute('aria-expanded', 'true');
      clearTimeout(timer);
      timer = setTimeout(close, 4000);
    });
    el.addEventListener('mouseenter', function () { clearTimeout(timer); });
    el.addEventListener('focusin', function () { clearTimeout(timer); });
    el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) close(); });
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
      // Read.me logo tiles arrive the same way, a little quicker since there are ten of them.
      entries.filter(function (en) { return en.isIntersecting && en.target.classList.contains('logo-tile'); })
        .map(function (en) { return en.target; })
        .sort(function (a, b) { var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return (ra.top - rb.top) || (ra.left - rb.left); })
        .forEach(function (el, k) { el.style.setProperty('--appear-delay', (k * 0.07) + 's'); });
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          el.classList.add('is-in'); io.unobserve(el);
          var done = function (ev) { if (ev.target === el && ev.propertyName === 'opacity') { el.classList.add('settled'); el.removeEventListener('transitionend', done); } };
          el.addEventListener('transitionend', done);
        }
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

  // Animated text: screen readers get the sentence once; the animated pieces sit in one hidden wrapper.
  function spoken(el, text) {
    el.textContent = '';
    var sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text;
    var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    el.appendChild(sr); el.appendChild(vis);
    return vis;
  }

  /* ---------- Letter-by-letter reveal ---------- */
  document.querySelectorAll('[data-letters]').forEach(function (el) {
    if (reduceMotion) return;
    var text = el.textContent, vis = spoken(el, text);
    text.split('').forEach(function (ch, k) {
      var s = document.createElement('span');
      s.className = 'letter';
      s.style.animationDelay = (0.1 + k * 0.05) + 's';
      s.textContent = ch;
      vis.appendChild(s);
    });
  });

  if (reduceMotion) return;

  /* ---------- 4: mockups float slightly behind their cards ---------- */
  var floaters = [].slice.call(document.querySelectorAll('.cs-hero img, .gcard__img'));
  var pending = false;
  function float() {
    pending = false;
    if (!on('parallax')) return;
    var vw = innerWidth, vh = innerHeight;
    floaters.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200 || r.right < -200 || r.left > vw + 200) return;
      var cy = r.top + r.height / 2 - vh / 2, cx = r.left + r.width / 2 - vw / 2;
      el.style.setProperty('--py', (-cy * 0.05).toFixed(1) + 'px');
      el.style.setProperty('--px', (-cx * 0.04).toFixed(1) + 'px');
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

  /* ---------- the framing question arrives word by word ---------- */
  if (on('words')) {
    document.querySelectorAll('.cs-header__question').forEach(function (q) {
      var text = q.textContent, vis = spoken(q, text);
      text.split(/(\s+)/).forEach(function (part, k) {
        if (/^\s+$/.test(part)) { vis.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span');
        w.className = 'w';
        w.style.animationDelay = (0.35 + (k / 2) * 0.045).toFixed(3) + 's';
        w.textContent = part;
        vis.appendChild(w);
      });
    });
  }

  /* ---------- case-study chapters — hero first, then its cards ---------- */
  if (on('chapters') && matchMedia('(min-width: 1280px)').matches) {
    document.querySelectorAll('.cs-group').forEach(function (g) {
      var hero = g.querySelector('.cs-hero');
      if (hero) hero.style.setProperty('--appear-delay', '0s');
      g.querySelectorAll('.cs-card').forEach(function (c, k) { c.style.setProperty('--appear-delay', (0.22 + k * 0.2) + 's'); });
    });
  }

  /* ---------- previous and next projects' tints rise from their own sides near the end ---------- */
  var footer = document.querySelector('.cs-footer'), bleeds = [];
  if (on('bleed') && footer) {
    [['prev', '.next__card--prev'], ['next', '.next__card--next']].forEach(function (pair) {
      var card = document.querySelector(pair[1]);
      if (!card) return;
      var b = document.createElement('div');
      b.className = 'next-bleed next-bleed--' + pair[0]; b.setAttribute('aria-hidden', 'true');
      b.style.setProperty('--bleed-tint', card.style.getPropertyValue('--card-tint'));
      document.body.appendChild(b);
      bleeds.push(b);
    });
  }
  var bleedPending = false;
  function bleedStep() {
    bleedPending = false;
    var f = footer.getBoundingClientRect(), vh = innerHeight;
    var o = Math.max(0, Math.min(1, (vh - f.top + 120) / (vh * 0.7)));
    bleeds.forEach(function (b) { b.style.setProperty('--bleed-o', (o * 0.95).toFixed(3)); });
  }
  if (bleeds.length) {
    addEventListener('scroll', function () { if (!bleedPending) { bleedPending = true; raf(bleedStep); } }, { passive: true });
    bleedStep();
  }

  /* ---------- Read.me photos develop like film ---------- */
  if (on('develop') && 'IntersectionObserver' in window) {
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('developed'); dio.unobserve(en.target); } });
    }, { threshold: 0.3 });
    document.querySelectorAll('.photo').forEach(function (p) { dio.observe(p); });
  }

})();

/* ---------- First visit is remembered after this page ---------- */
try { localStorage.setItem('visited', '1'); } catch (e) {}

/* ---------- Services: inquiry form ----------
   Sends the answers straight to Wes's inbox as a markdown email through FormSubmit (the site has no server).
   If sending fails, the visitor can fall back to their own mail app with the same message. */
(function () {
  var form = document.getElementById('inquiry-form');
  if (!form) return;
  form.noValidate = true;
  var TO = 'ahaines90@gmail.com';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || form).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || form).querySelectorAll(s)); };
  var body = $('.svc-form__body'), errors = $('#inquiry-errors'), done = $('#inquiry-done');
  var status = $('#inquiry-status'), preview = $('#inquiry-preview'), details = $('#f-details');
  var say = function (msg) { status.textContent = ''; setTimeout(function () { status.textContent = msg; }, 30); };
  var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var LINK = /^(https?:\/\/)?[^\s\/.]+(\.[^\s\/.]+)+(\/\S*)?$/i;

  var RULES_UNORDERED = [
    { id: 'f-details', name: 'details', check: function (v) {
      if (!v) return 'Tell me a little about the project.';
      if (v.length < 20) return 'Add a bit more, at least 20 characters.';
    } },
    { id: 'f-link', name: 'link', check: function (v) { if (v && !LINK.test(v)) return 'Enter a link like company.com, or leave this blank.'; } },
    { id: 'f-name', name: 'name', check: function (v) { if (!v) return 'Enter your name.'; } },
    { id: 'f-company', name: 'company', check: function (v) { if (!v) return 'Enter your company or project.'; } },
    { id: 'f-email', name: 'email', check: function (v) {
      if (!v) return 'Enter your email so I can reply.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter an email like you@company.com.';
    } }
  ];
  var RULES = ['f-name', 'f-company', 'f-email', 'f-link', 'f-details'].map(function (id) { return RULES_UNORDERED.filter(function (r) { return r.id === id; })[0]; });
  var tried = false;

  function setError(rule, msg) {
    var input = document.getElementById(rule.id), out = document.getElementById(rule.id + '-error');
    if (msg) { input.setAttribute('aria-invalid', 'true'); out.innerHTML = '<span class="sr-only">Error: </span>' + msg; }
    else { input.removeAttribute('aria-invalid'); out.textContent = ''; }
  }
  function renderSummary(list) {
    if (!list.length) { errors.hidden = true; errors.innerHTML = ''; return; }
    errors.innerHTML = '<h3 class="svc-errors__title" id="inquiry-errors-title">' + (list.length === 1 ? '1 thing to fix' : list.length + ' things to fix') + '</h3>'
      + '<ul role="list">' + list.map(function (e) { return '<li><a class="svc-link" href="#' + e.rule.id + '">' + e.msg + '</a></li>'; }).join('') + '</ul>';
    errors.hidden = false;
  }
  function validate() {
    var list = [];
    RULES.forEach(function (r) { var m = r.check(val(r.id)); setError(r, m); if (m) list.push({ rule: r, msg: m }); });
    return list;
  }
  // After a failed submit, fields re-check as they change: an error can clear or change its message, but no new error appears while typing.
  RULES.forEach(function (r) {
    var el = document.getElementById(r.id);
    var recheck = function () {
      if (!tried || el.getAttribute('aria-invalid') !== 'true') return;
      var m = r.check(val(r.id)) || null;
      if (m !== document.getElementById(r.id + '-error').textContent.replace(/^Error: /, '')) {
        setError(r, m);
        renderSummary(RULES.filter(function (x) { return document.getElementById(x.id).getAttribute('aria-invalid') === 'true'; })
          .map(function (x) { return { rule: x, msg: document.getElementById(x.id + '-error').textContent.replace(/^Error: /, '') }; }));
      }
    };
    el.addEventListener('input', recheck);
    el.addEventListener('blur', recheck);
  });
  errors.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    var el = document.getElementById(a.getAttribute('href').slice(1));
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  });

  // Character count near the limit; screen readers only hear the thresholds.
  var count = $('#f-details-count'), live = $('#f-details-live'), lastLive = '';
  details.addEventListener('input', function () {
    var n = details.value.length;
    count.textContent = n >= 800 ? n.toLocaleString() + ' of 1,000 characters' : '';
    var msg = n >= 1000 ? 'No characters left' : n >= 900 ? '100 characters left' : '';
    if (msg !== lastLive) { live.textContent = msg; lastLive = msg; }
  });

  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  var submit = $('.svc-submit');

  // The email Wes receives: markdown, readable as plain text in any mail app.
  function compose() {
    var radio = function (n) { var r = $('input[name="' + n + '"]:checked'); return r ? r.value : ''; };
    var v = { interest: val('f-interest'), name: val('f-name'), email: val('f-email'), company: val('f-company'), link: val('f-link'), budget: val('f-budget'),
              scope: radio('Scope'), timing: radio('Timing'), details: val('f-details').replace(/\r\n?/g, '\n') };
    var row = function (k, x) { return '**' + k + ':** ' + (x || '—'); };
    var md = ['## New project inquiry', '',
      row('Interested in', v.interest), row('Name', v.name), row('Email', v.email), row('Company', v.company), row('Link', v.link), row('Budget', v.budget),
      row('Scope', v.scope), row('Timing', v.timing), '',
      '### Project', '', v.details, '', '---', '_Sent from wesleyhaines.com/services_'].join('\n');
    return { v: v, subject: 'Project inquiry' + (v.interest ? ': ' + v.interest : '') + ' — ' + (v.company || v.name), md: md };
  }
  var mailto = function (subject, text) { return 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text); };

  function show(state, m) {
    body.hidden = true; errors.hidden = true; done.hidden = false;
    $$('[data-done]', done).forEach(function (el) { el.hidden = el.getAttribute('data-done') !== state; });
    var title = $('#inquiry-done-title');
    title.textContent = state === 'sent' ? 'Sent' : 'Not sent yet';
    if (state === 'sent') $('[data-sent-to]', done).textContent = m.v.email;
    else { $('[data-reopen]', done).href = mailto(m.subject, m.md); preview.value = 'To: ' + TO + '\nSubject: ' + m.subject + '\n\n' + m.md; }
    title.focus({ preventScroll: true });
    title.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submit.disabled) return;
    tried = true;
    var list = validate();
    renderSummary(list);
    if (list.length) { errors.focus({ preventScroll: true }); errors.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); return; }
    if ($('input[name="_honey"]').value) return;   // bots fill the hidden field; people never see it
    var m = compose();
    submit.disabled = true; submit.textContent = 'Sending…'; say('Sending your inquiry.');
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: m.subject, _template: 'basic', _captcha: 'false', name: m.v.name, email: m.v.email, message: m.md,
        // The confirmation the sender gets back
        _autoresponse: 'Hi ' + m.v.name.split(' ')[0] + ',\n\nThanks for reaching out. Your inquiry came through and I’ll reply within 2 business days.\n\nWes\nwesleyhaines.com' })
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) === 'false') throw new Error(j.message || r.status); }); })
      .then(function () { show('sent', m); form.reset(); setInterest(''); }, function () { show('failed', m); })
      .then(function () { submit.disabled = false; submit.textContent = 'Submit'; });
  });

  // "Ask about this" on an offer card marks the inquiry with that service and brings up the form.
  var interest = document.querySelector('.svc-interest');
  function setInterest(name) {
    $('#f-interest').value = name;
    interest.hidden = !name;
    if (name) interest.querySelector('[data-interest-name]').textContent = name;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-service]');
    if (!a) return;
    e.preventDefault();
    setInterest(a.getAttribute('data-service'));
    if (!done.hidden) { done.hidden = true; body.hidden = false; }
    document.getElementById('inquiry').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    $('#f-name').focus({ preventScroll: true });
    say(a.getAttribute('data-service') + ' added to your inquiry.');
  });
  interest.querySelector('[data-interest-clear]').addEventListener('click', function () { setInterest(''); $('#f-name').focus(); });

  var copyTimer;
  done.addEventListener('click', function (e) {
    var copy = e.target.closest('[data-copy]'), edit = e.target.closest('[data-edit]');
    if (copy) {
      var fallback = function () {
        $('.svc-done__preview', done).hidden = false;
        preview.focus(); preview.select();
        say('Your message is below and selected. Press Ctrl+C or ⌘+C to copy it.');
      };
      if (!navigator.clipboard || !navigator.clipboard.writeText) { fallback(); return; }
      navigator.clipboard.writeText(preview.value).then(function () {
        clearTimeout(copyTimer);
        copy.textContent = 'Copied';
        copyTimer = setTimeout(function () { copy.textContent = 'Copy message'; }, 2000);
        say('Copied. Paste it into a new email to ' + TO + '.');
      }, fallback);
    }
    if (edit) {
      done.hidden = true; body.hidden = false;
      $('.svc-done__preview', done).hidden = true;
      $('#f-name').focus();
    }
  });
})();

/* ---------- Services: headline stickers cycle through every case-study mockup ----------
   Each slot steps through the same list from its own starting point, a beat apart, so no two show the same mockup.
   Images load just before their turn; slots rest while off screen, in a hidden tab, or under reduced motion. */
(function () {
  var slots = [].slice.call(document.querySelectorAll('[data-rotor]'));
  if (!slots.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var PERIOD = 3200, visible = true;
  slots.forEach(function (slot, n) {
    var list = JSON.parse(slot.getAttribute('data-rotor')), i = +slot.getAttribute('data-start') || 0;
    var imgs = {}; imgs[i] = slot.querySelector('img');
    function load(k) {
      if (imgs[k]) return Promise.resolve(imgs[k]);
      var im = new Image(); im.alt = ''; im.decoding = 'async'; im.src = list[k];
      imgs[k] = im; slot.appendChild(im);
      return (im.decode ? im.decode() : Promise.resolve()).then(function () { return im; }, function () { return im; });
    }
    function step() {
      if (!visible || document.hidden) return;
      var next = (i + 1) % list.length;
      load(next).then(function (im) {
        imgs[i].classList.remove('is-on');
        im.classList.add('is-on');
        i = next;
        load((i + 1) % list.length);   // warm the one after
      });
    }
    load((i + 1) % list.length);
    setTimeout(function () { setInterval(step, PERIOD); }, 1200 + n * (PERIOD / slots.length));
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(slots[0].closest('h1') || slots[0]);
  }
})();
