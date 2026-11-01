/* Works gallery + player (video.html). Plain script, no dependencies. */
(function () {
  const track = document.getElementById('worksTrack');
  if (!track) return;
  const cards = [...track.querySelectorAll('.work')];
  const prev = document.getElementById('worksPrev'), next = document.getElementById('worksNext'), dotsEl = document.getElementById('worksDots');
  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>'
  };

  /* ---------- carousel ---------- */
  const step = () => { const c = cards[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 20) : 300; };
  const idx = () => Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / step())));
  dotsEl.innerHTML = cards.map(() => '<i></i>').join('');
  function sync() {
    const i = idx(), max = track.scrollWidth - track.clientWidth - 2;
    [...dotsEl.children].forEach((d, k) => d.classList.toggle('on', k === i));
    prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max;
  }
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', sync); sync();
  // mouse wheel + shift / trackpad horizontal already native; allow mouse drag on desktop
  let dragX = null, startL = 0, moved = false;
  track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; dragX = e.clientX; startL = track.scrollLeft; moved = false; });
  window.addEventListener('pointermove', e => { if (dragX === null) return; const dx = e.clientX - dragX; if (Math.abs(dx) > 6) { moved = true; track.style.scrollSnapType = 'none'; track.scrollLeft = startL - dx; } });
  window.addEventListener('pointerup', () => { if (dragX === null) return; dragX = null; track.style.scrollSnapType = ''; if (moved) track.scrollTo({ left: idx() * step(), behavior: 'smooth' }); });
  track.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);

  /* ---------- player ---------- */
  const wm = document.createElement('div');
  wm.className = 'wm'; wm.setAttribute('role', 'dialog'); wm.setAttribute('aria-modal', 'true'); wm.setAttribute('aria-label', 'Видеоплеер');
  wm.innerHTML = `
    <button class="wm-nav wm-prev" aria-label="Предыдущее видео"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
    <div class="wm-box">
      <video playsinline preload="metadata"></video>
      <div class="wm-title"></div>
      <button class="wm-x" aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
      <button class="wm-big" aria-label="Воспроизвести">${ICON.play}</button>
      <div class="wm-bar">
        <div class="wm-seek" role="slider" aria-label="Перемотка" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><div class="wm-rail"><div class="wm-buf"></div><div class="wm-fill"></div></div><div class="wm-knob"></div></div>
        <div class="wm-row">
          <button class="wm-btn main wm-pp" aria-label="Пауза">${ICON.pause}</button>
          <button class="wm-btn wm-back" aria-label="Назад на 10 секунд"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><text x="12" y="15.5" font-size="8" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arial">10</text></svg></button>
          <button class="wm-btn wm-fwd" aria-label="Вперёд на 10 секунд"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/><text x="12" y="15.5" font-size="8" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arial">10</text></svg></button>
          <div class="wm-time">0:00 / 0:00</div><div class="wm-sp"></div>
          <button class="wm-btn wm-mute" aria-label="Звук">${ICON.vol}</button>
        </div>
      </div>
    </div>
    <button class="wm-nav wm-next" aria-label="Следующее видео"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>`;
  document.body.appendChild(wm);
  const $ = s => wm.querySelector(s);
  const v = $('video'), seek = $('.wm-seek'), fill = $('.wm-fill'), buf = $('.wm-buf'), knob = $('.wm-knob'), time = $('.wm-time'), pp = $('.wm-pp'), mute = $('.wm-mute');
  let cur = -1, drag = false, idleT = null, lastFocus = null;
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  function ui() {
    const d = v.duration || 0, t = v.currentTime || 0, p = d ? t / d : 0;
    fill.style.width = (p * 100) + '%'; knob.style.left = (p * 100) + '%';
    seek.setAttribute('aria-valuenow', Math.round(p * 100));
    time.textContent = fmt(t) + ' / ' + fmt(d);
    if (v.buffered.length) buf.style.width = (v.buffered.end(v.buffered.length - 1) / (d || 1) * 100) + '%';
  }
  function state() {
    const playing = !v.paused && !v.ended;
    pp.innerHTML = playing ? ICON.pause : ICON.play; pp.setAttribute('aria-label', playing ? 'Пауза' : 'Воспроизвести');
    wm.classList.toggle('paused', !playing);
  }
  function wake() { wm.classList.remove('idle'); clearTimeout(idleT); if (!v.paused) idleT = setTimeout(() => wm.classList.add('idle'), 2600); }

  function open(i, fromKey) {
    cur = (i + cards.length) % cards.length;
    const c = cards[cur];
    if (!wm.classList.contains('open')) { lastFocus = document.activeElement; document.documentElement.classList.add('wm-lock'); wm.classList.add('open'); }
    $('.wm-title').textContent = c.dataset.title || '';
    v.poster = c.dataset.poster || ''; v.src = c.dataset.src; v.currentTime = 0;
    v.play().catch(() => {});
    ui(); state(); wake();
    $('.wm-x').focus({ preventScroll: true });
  }
  function close() {
    v.pause(); v.removeAttribute('src'); v.load();
    wm.classList.remove('open', 'idle'); document.documentElement.classList.remove('wm-lock');
    if (cur >= 0) track.scrollTo({ left: cur * step(), behavior: 'auto' });
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  const toggle = () => { v.paused ? v.play().catch(() => {}) : v.pause(); };
  const jump = d => { v.currentTime = Math.min(Math.max(0, v.currentTime + d), v.duration || 1e9); ui(); wake(); };

  cards.forEach((c, i) => c.addEventListener('click', () => open(i)));
  v.addEventListener('timeupdate', ui); v.addEventListener('progress', ui); v.addEventListener('loadedmetadata', ui);
  v.addEventListener('play', () => { state(); wake(); }); v.addEventListener('pause', () => { state(); wake(); });
  v.addEventListener('ended', () => { state(); wm.classList.remove('idle'); });
  v.addEventListener('click', () => { toggle(); wake(); });
  pp.addEventListener('click', () => { toggle(); wake(); });
  $('.wm-big').addEventListener('click', toggle);
  $('.wm-back').addEventListener('click', () => jump(-10)); $('.wm-fwd').addEventListener('click', () => jump(10));
  $('.wm-x').addEventListener('click', close);
  $('.wm-prev').addEventListener('click', () => open(cur - 1)); $('.wm-next').addEventListener('click', () => open(cur + 1));
  mute.addEventListener('click', () => { v.muted = !v.muted; mute.innerHTML = v.muted ? ICON.mute : ICON.vol; });
  wm.addEventListener('click', e => { if (e.target === wm) close(); });
  wm.addEventListener('mousemove', wake); wm.addEventListener('touchstart', wake, { passive: true });

  const setFrom = e => { const r = seek.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); if (v.duration) { v.currentTime = p * v.duration; ui(); } };
  seek.addEventListener('pointerdown', e => { drag = true; seek.classList.add('drag'); seek.setPointerCapture(e.pointerId); setFrom(e); });
  seek.addEventListener('pointermove', e => { if (drag) setFrom(e); });
  seek.addEventListener('pointerup', e => { drag = false; seek.classList.remove('drag'); });
  seek.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { jump(-5); e.preventDefault(); } if (e.key === 'ArrowRight') { jump(5); e.preventDefault(); } });

  // swipe left/right inside the player = previous / next video (touch)
  let sx = 0, sy = 0;
  wm.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  wm.addEventListener('touchend', e => { if (e.target.closest('.wm-bar')) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) open(cur + (dx < 0 ? 1 : -1)); }, { passive: true });

  document.addEventListener('keydown', e => {
    if (!wm.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === ' ' || e.key === 'k') { if (document.activeElement && document.activeElement.tagName === 'BUTTON' && e.key === ' ') return; e.preventDefault(); toggle(); wake(); }
    else if (e.key === 'ArrowLeft' && document.activeElement !== seek) jump(-5);
    else if (e.key === 'ArrowRight' && document.activeElement !== seek) jump(5);
    else if (e.key === 'ArrowUp') open(cur - 1); else if (e.key === 'ArrowDown') open(cur + 1);
    else if (e.key === 'm') mute.click();
  });
})();
