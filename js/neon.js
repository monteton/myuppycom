/* MYUPPY neon — shared behaviour: smooth scroll, reveals, cursor, i18n, hover light */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ---------- i18n (data-en holds the English text; RU is the markup) ---------- */
  const KEY = 'myuppy_lang';
  let lang = 'ru';
  try { lang = localStorage.getItem(KEY) || 'ru'; } catch (e) {}
  $$('[data-en]').forEach(el => { el.dataset.ru = el.innerHTML; });
  function setLang(l) {
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    root.lang = l;
    $$('[data-en]').forEach(el => { el.innerHTML = l === 'en' ? el.dataset.en : el.dataset.ru; });
    $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  }
  $$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang(lang);

  /* ---------- mobile menu ---------- */
  const burger = $('.burger'), mm = $('.mmenu');
  if (burger && mm) {
    burger.addEventListener('click', () => mm.classList.toggle('open'));
    $$('a', mm).forEach(a => a.addEventListener('click', () => mm.classList.remove('open')));
  }

  /* ---------- hover spotlight on cards ---------- */
  $$('.card, .fcard').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ---------- custom cursor ---------- */
  const cur = $('.cur'), dot = $('.cur-dot');
  if (cur && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; });
    (function loop() { cx += (x - cx) * .18; cy += (y - cy) * .18; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('[data-cur]')));
  }

  /* ---------- magnetic buttons ---------- */
  if (!reduce) $$('.btn, .arrow').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  if (!hasG) return;
  root.classList.remove('no-js');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  if (typeof Lenis !== 'undefined' && !reduce) {
    const lenis = new Lenis({ lerp: .09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); }
    }));
  }

  /* ---------- hero title letters ---------- */
  $$('.split').forEach(h => {
    const txt = h.textContent; h.textContent = '';
    [...txt].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; h.appendChild(s); });
    gsap.from($$('.ch', h), { yPercent: 110, rotate: 6, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .06, delay: .25 });
  });
  gsap.from('.hero-in > *:not(h1), .page-hero .rise', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1, delay: .6 });

  /* ---------- reveals ---------- */
  ScrollTrigger.batch('.rv', {
    start: 'top 88%', once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .09 })
  });

  /* ---------- manifesto words ---------- */
  $$('.mani').forEach(m => {
    const walk = n => {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(w => { if (!w.trim()) { f.appendChild(document.createTextNode(w)); return; } const s = document.createElement('span'); s.className = 'w'; s.textContent = w; f.appendChild(s); });
          c.replaceWith(f);
        } else if (c.nodeType === 1) walk(c);
      });
    };
    walk(m);
    gsap.to($$('.w', m), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: m, start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
  });

  /* ---------- counters ---------- */
  $$('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count), suf = el.dataset.suf || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }) });
  });

  /* ---------- parallax ---------- */
  $$('[data-par]').forEach(el => gsap.to(el, { yPercent: parseFloat(el.dataset.par), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* ---------- nav shrink ---------- */
  const nav = $('.nav-in');
  if (nav) ScrollTrigger.create({ start: 80, onUpdate: s => nav.style.background = s.scroll() > 80 ? 'rgba(8,10,18,.82)' : '' });

  /* ---------- product screenshot cycler ---------- */
  $$('.stack').forEach(st => {
    const w = $$('.win', st); if (w.length < 2) return; let i = 0;
    w[0].classList.add('on');
    setInterval(() => { w[i].classList.remove('on'); i = (i + 1) % w.length; w[i].classList.add('on'); }, 3200);
  });
})();
