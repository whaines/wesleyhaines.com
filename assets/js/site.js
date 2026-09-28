/* wesleyhaines.com — small progressive enhancements. The page works without this file. */
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Light / dark ---------- */
  function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (btn) setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
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

  /* ---------- Scroll-in animations ---------- */
  var appear = document.querySelectorAll('[data-appear]');
  if (/[?&]static\b/.test(location.search)) {   // preview/screenshot mode: everything at rest, images eager
    reduceMotion = true;
    root.classList.remove('js');
    document.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
    appear.forEach(function (el) { io.observe(el); });
  } else {
    appear.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- "Hello world" typewriter ---------- */
  var HELLOS = [
    'Hello\nworld', 'Bonjour\nle monde', 'Hola\nMundo', 'Hallo\nWelt', 'Ciao\nMondo', 'こんにちは\n世界', '你好\n世界',
    '안녕하세요\n세계', 'नमस्ते\nदुनिया', 'Olá\nMundo', 'হ্যালো\nবিশ্ব', 'Привет\nмир', 'Merhaba\nDünya', 'Xin chào\nThế giới', 'Hej\nvärlden'
  ];
  document.querySelectorAll('[data-typewriter]').forEach(function (el) {
    var twoLines = el.hasAttribute('data-two-lines');
    var list = HELLOS.map(function (s) { return twoLines ? s : s.replace('\n', ' '); });
    var out = el.querySelector('[data-typewriter-text]') || el;
    if (reduceMotion) { out.textContent = list[0]; return; }
    var order = [list[0]].concat(list.slice(1).sort(function () { return Math.random() - 0.5; }));
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
    setTimeout(tick, 400);
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
})();
