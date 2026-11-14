(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // Header border + mobile menu
  const header = $('[data-header]');
  const onScrollHeader = () => header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScrollHeader, { passive: true }); onScrollHeader();
  const btn = $('[data-menu]'), menu = $('#menu');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', open); menu.classList.toggle('is-open', open);
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => { btn.setAttribute('aria-expanded', false); menu.classList.remove('is-open'); }));

  // Reveal once
  if (!reduce && 'IntersectionObserver' in window) {
    const els = $$('.head, .work__card, .feature, .plan, .steps li, .seo__card, .seo__chat, .faq details, .about > *');
    els.forEach(el => {
      el.setAttribute('data-reveal', '');
      const sib = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      el.style.setProperty('--rd', Math.min(sib.indexOf(el), 4) * 70 + 'ms');
    });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  // Outdated -> outstanding wipe, scrubbed by scroll
  const track = $('[data-wipe]');
  if (track) {
    const stage = $('.wipe__stage', track);
    const url = $('[data-wipe-url]', track);
    let target = 0, cur = 0, raf = 0;
    const measure = () => { const r = track.getBoundingClientRect(); return clamp((-r.top + innerHeight * .15) / (r.height - innerHeight)); };
    const apply = w => {
      const v = clamp((w - .12) / .7);
      stage.style.setProperty('--w', v.toFixed(4));
      url.textContent = v > .5 ? 'www.greenfingers.co.uk' : 'www.greenfingers-gardening.co.uk';
    };
    const tick = () => { cur += (target - cur) * .18; if (Math.abs(target - cur) < .0005) cur = target; apply(cur); raf = cur === target ? 0 : requestAnimationFrame(tick); };
    if (reduce) apply(1);
    else {
      const on = () => { target = measure(); if (!raf) raf = requestAnimationFrame(tick); };
      addEventListener('scroll', on, { passive: true }); addEventListener('resize', on, { passive: true });
      cur = target = measure(); apply(cur);
    }
  }

  // Plan buttons preselect the package
  $$('[data-plan]').forEach(a => a.addEventListener('click', () => { $('#f-plan').value = a.dataset.plan; }));

  // Contact form: validates, then opens the visitor's email app with the enquiry
  const form = $('[data-form]');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', form).filter(i => { const b = !i.value.trim(); i.setAttribute('aria-invalid', b); return b; });
    $('[data-form-err]', form).textContent = bad.length ? 'Please fill in your name, business name and phone number.' : '';
    if (bad.length) { bad[0].focus(); return; }
    const d = new FormData(form);
    const body = `Name: ${d.get('name')}\nBusiness: ${d.get('business')}\nPhone: ${d.get('phone')}\nEmail: ${d.get('email')}\nPackage: ${d.get('plan')}\n\n${d.get('message') || ''}`;
    const href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Website enquiry: ' + d.get('business'))}&body=${encodeURIComponent(body)}`;
    form.innerHTML = `<div class="form__done"><h3>Thanks, ${esc(d.get('name').split(' ')[0])}!</h3><p>Your enquiry is ready. Tap below to send it from your email app and I'll reply within 24 hours.</p><a class="btn btn--primary" href="${href.replace(/"/g, '&quot;')}">Send my enquiry</a></div>`;
    location.href = href;
  });

  const y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
