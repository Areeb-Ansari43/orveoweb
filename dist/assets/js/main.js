(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const isStatic = () => root.classList.contains('static');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Header + mobile menu */
  const header = $('[data-header]');
  const onHeader = () => header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onHeader, { passive: true }); onHeader();
  const btn = $('[data-menu]'), menu = $('#menu');
  const setMenu = open => { btn.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open); };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); btn.focus(); } });

  /* Word-by-word statement: wrap each word */
  $$('[data-words]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}">${esc(w)}</span>`).join(' ');
    el.style.setProperty('--n', words.length);
  });

  /* Scroll engine: every [data-scrub] gets --p from 0 to 1.
     Pinned tracks measure progress across their height; data-scrub="view" measures the element crossing the screen. */
  const tracks = $$('[data-scrub]').map(el => ({ el, mode: el.dataset.scrub || 'pin', cur: 0, target: 0, rank: $('[data-rank]', el), row: $('[data-hrow]', el) }));
  const measure = t => {
    const r = t.el.getBoundingClientRect(), vh = innerHeight;
    t.visible = r.bottom > -vh * .5 && r.top < vh * 1.5;
    t.target = t.mode === 'view' ? clamp((vh - r.top) / (vh + r.height)) : clamp(-r.top / Math.max(1, r.height - vh));
  };
  const layout = () => {
    tracks.forEach(t => { if (t.row) t.el.style.setProperty('--dist', Math.max(0, t.row.scrollWidth - innerWidth)); });
    $$('[data-travel]').forEach(img => {
      img.style.setProperty('--travel', Math.max(0, img.offsetHeight - img.parentElement.clientHeight) + 'px');
    });
  };
  const paint = t => {
    t.el.style.setProperty('--p', t.cur.toFixed(4));
    if (t.rank) { const q = clamp((t.cur - .08) / .62); t.rank.textContent = '#' + (Math.round(5 * (1 - q)) + 1); }
  };
  let raf = 0;
  const frame = () => {
    raf = 0;
    let moving = false;
    for (const t of tracks) {
      if (Math.abs(t.target - t.cur) < .0004) continue;
      t.cur += (t.target - t.cur) * .2;
      if (Math.abs(t.target - t.cur) < .0004) t.cur = t.target; else moving = true;
      paint(t);
    }
    if (moving) raf = requestAnimationFrame(frame);
  };
  const onScroll = () => { if (isStatic()) return; tracks.forEach(measure); if (!raf) raf = requestAnimationFrame(frame); };
  const start = () => {
    layout();
    if (isStatic()) { tracks.forEach(t => { t.cur = t.target = 1; paint(t); }); return; }
    tracks.forEach(t => { measure(t); t.cur = t.target; paint(t); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { layout(); onScroll(); }, { passive: true });
  addEventListener('load', start);
  $$('img[data-travel]').forEach(img => img.addEventListener('load', layout));
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', e => { root.classList.toggle('static', e.matches); start(); });
  start();

  /* Reveal once */
  if (!isStatic() && 'IntersectionObserver' in window) {
    const els = $$('.head, .mini-plan, .value, .faq details, .table-wrap, .trust__in, .cta__in > *');
    els.forEach(el => {
      el.setAttribute('data-reveal', '');
      const sib = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      el.style.setProperty('--rd', Math.min(sib.indexOf(el), 4) * 80 + 'ms');
    });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* Contact form: preselect plan from ?plan=, validate, open email app */
  const form = $('[data-form]');
  if (form) {
    const plan = new URLSearchParams(location.search).get('plan');
    if (plan && $(`#f-plan option[value="${CSS.escape(plan)}"]`)) $('#f-plan').value = plan;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const bad = $$('[required]', form).filter(i => { const b = !i.value.trim(); i.setAttribute('aria-invalid', b); return b; });
      $('[data-form-err]', form).textContent = bad.length ? 'Please fill in your name, business name and phone number.' : '';
      if (bad.length) { bad[0].focus(); return; }
      const d = new FormData(form);
      const planText = $('#f-plan').selectedOptions[0].text;
      const body = `Name: ${d.get('name')}\nBusiness: ${d.get('business')}\nPhone: ${d.get('phone')}\nEmail: ${d.get('email')}\nPackage: ${planText}\n\n${d.get('message') || ''}`;
      const href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Website enquiry: ' + d.get('business'))}&body=${encodeURIComponent(body)}`;
      form.innerHTML = `<div class="form__done"><h3>Thanks, ${esc(d.get('name').split(' ')[0])}!</h3><p>Your enquiry is ready. Tap below to send it from your email app and I'll reply within 24 hours.</p><a class="btn btn--primary" href="${href.replace(/"/g, '&quot;')}">Send my enquiry</a></div>`;
      location.href = href;
    });
  }
})();
