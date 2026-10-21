/* Polako RAW screenshot carousel: scroll-snap track, autoplay with progress dots, drag, thumbs, lightbox */
(() => {
  const gal = document.getElementById('gal'), track = document.getElementById('track');
  if (!gal || !track) return;
  const slides = [...track.querySelectorAll('.slide')];
  const dots = gal.querySelector('.dots'), thumbs = document.getElementById('thumbs');
  const DUR = 6000;
  let cur = 0, timer = null, down = false, sx = 0, sl = 0, moved = 0;
  dots.style.setProperty('--dur', DUR + 'ms');

  slides.forEach((s, i) => {
    const d = document.createElement('button'); d.setAttribute('aria-label', 'Slide ' + (i + 1)); d.addEventListener('click', () => go(i)); dots.appendChild(d);
    const t = document.createElement('button'); t.innerHTML = `<img src="${s.dataset.src}" alt="" loading="lazy">`; t.addEventListener('click', () => go(i)); thumbs.appendChild(t);
  });

  const centerOf = el => el.offsetLeft - (track.clientWidth - el.clientWidth) / 2;
  function mark(i) {
    cur = i;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    [...dots.children].forEach((d, k) => { d.classList.remove('on'); if (k === i) { void d.offsetWidth; d.classList.add('on'); } });
    [...thumbs.children].forEach((t, k) => t.classList.toggle('on', k === i));
    const t = thumbs.children[i]; if (t) thumbs.scrollTo({ left: t.offsetLeft - thumbs.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
    arm();
  }
  function go(i) { i = (i + slides.length) % slides.length; track.scrollTo({ left: centerOf(slides[i]), behavior: 'smooth' }); mark(i); }
  function arm() { clearTimeout(timer); if (gal.classList.contains('paused')) return; timer = setTimeout(() => go(cur + 1), DUR); }
  function pause(v) { gal.classList.toggle('paused', v); if (v) clearTimeout(timer); else mark(cur); }

  gal.querySelectorAll('.arrow').forEach(a => a.addEventListener('click', () => go(cur + +a.dataset.dir)));

  // nearest slide while the user scrolls/drags
  let raf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const c = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bd = 1e9;
      slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.clientWidth / 2 - c); if (d < bd) { bd = d; best = i; } });
      if (best !== cur) mark(best);
    });
  }, { passive: true });

  // mouse drag
  track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft; track.classList.add('drag'); });
  addEventListener('pointermove', e => { if (!down) return; moved = e.clientX - sx; track.scrollLeft = sl - moved; });
  addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('drag'); go(cur); });

  gal.addEventListener('pointerenter', () => pause(true));
  gal.addEventListener('pointerleave', () => pause(false));
  new IntersectionObserver(es => { pause(!es[0].isIntersecting); }, { threshold: .15 }).observe(gal);
  addEventListener('keydown', e => { if (lb.classList.contains('open')) return; if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });

  // lightbox
  const lb = document.getElementById('lb'), lbi = lb.querySelector('img'), cap = lb.querySelector('.cap');
  let li = 0;
  function show(i) { li = (i + slides.length) % slides.length; const s = slides[li]; lbi.src = s.dataset.src; cap.textContent = s.querySelector('h4').textContent + '  ·  ' + (li + 1) + ' / ' + slides.length; }
  function open(i) { show(i); lb.classList.add('open'); window.__lenis && window.__lenis.stop(); }
  function close() { lb.classList.remove('open'); window.__lenis && window.__lenis.start(); }
  slides.forEach((s, i) => s.querySelector('.win').addEventListener('click', () => { if (Math.abs(moved) < 6) open(i); }));
  lb.querySelector('.x').addEventListener('click', close);
  lb.querySelector('.pv').addEventListener('click', () => show(li - 1));
  lb.querySelector('.nx').addEventListener('click', () => show(li + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(li + 1); if (e.key === 'ArrowLeft') show(li - 1); });

  addEventListener('load', () => { track.scrollLeft = centerOf(slides[0]); mark(0); });
  addEventListener('resize', () => track.scrollTo({ left: centerOf(slides[cur]) }));
})();
