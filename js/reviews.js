/* Polako RAW reviews: reads approved reviews from Supabase REST, posts new ones as pending (moderated). */
(() => {
  const SB = { url: 'https://ztclxqpzourodvucddtu.supabase.co', key: 'sb_publishable_Bh9bKGmEQ0u30DXGcZ7gHQ_DDs-yM2d' };
  const T = 'polako_reviews';
  const list = document.getElementById('rev-list'), form = document.getElementById('rev-form');
  if (!list || !form) return;
  const msg = document.getElementById('form-msg'), pick = document.getElementById('star-pick');
  const en = () => document.documentElement.lang === 'en';
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  let rating = 0;

  const say = (ru, eng, ok) => { msg.textContent = en() ? eng : ru; msg.className = 'form-msg ' + (ok ? 'ok' : 'err'); };
  const hdr = { apikey: SB.key, Authorization: 'Bearer ' + SB.key };

  pick.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    rating = +b.dataset.v;
    [...pick.children].forEach(x => { x.classList.toggle('on', +x.dataset.v <= rating); x.setAttribute('aria-checked', +x.dataset.v === rating); });
  });

  function card(r) {
    const a = document.createElement('article'); a.className = 'rev';
    const h = document.createElement('header');
    const s = document.createElement('span'); s.className = 'stars'; s.textContent = stars(r.rating);
    const n = document.createElement('b'); n.textContent = r.name;
    const t = document.createElement('time'); t.textContent = new Date(r.created_at).toLocaleDateString(en() ? 'en-GB' : 'ru-RU');
    h.append(s, n, t);
    const p = document.createElement('p'); p.textContent = r.body;
    a.append(h, p); return a;
  }

  async function load() {
    try {
      const res = await fetch(`${SB.url}/rest/v1/${T}?select=name,rating,body,created_at&order=created_at.desc&limit=50`, { headers: hdr });
      if (!res.ok) return;
      const rows = await res.json();
      rows.forEach(r => list.appendChild(card(r)));
      if (rows.length) {
        const avg = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
        document.getElementById('rating').hidden = false;
        document.getElementById('rating-num').textContent = avg.toFixed(1);
        document.getElementById('rating-stars').textContent = stars(Math.round(avg));
        document.getElementById('rating-count').textContent = rows.length + (en() ? ' reviews' : ' отзыв.');
      }
    } catch (e) { /* the page still works without the list */ }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form);
    if (f.get('website')) return;                                  // honeypot
    const name = (f.get('name') || '').trim(), body = (f.get('body') || '').trim();
    if (!name) return say('Укажите имя.', 'Please enter your name.');
    if (!rating) return say('Поставьте оценку.', 'Please pick a rating.');
    if (body.length < 10) return say('Отзыв слишком короткий — хотя бы 10 символов.', 'Too short — at least 10 characters.');
    try { if (Date.now() - +localStorage.getItem('polako_rev_t') < 60000) return say('Подождите минуту перед следующим отзывом.', 'Please wait a minute before another review.'); } catch (e) {}
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      const res = await fetch(`${SB.url}/rest/v1/${T}`, {
        method: 'POST', headers: { ...hdr, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ name, rating, body })
      });
      if (!res.ok) throw new Error(res.status);
      try { localStorage.setItem('polako_rev_t', Date.now()); } catch (e) {}
      form.reset(); rating = 0; [...pick.children].forEach(x => x.classList.remove('on'));
      say('Спасибо! Отзыв появится после короткой проверки.', 'Thank you! Your review will appear after a quick check.', true);
    } catch (err) { say('Не удалось отправить. Попробуйте позже.', 'Could not send. Please try again later.'); }
    btn.disabled = false;
  });

  load();
})();
