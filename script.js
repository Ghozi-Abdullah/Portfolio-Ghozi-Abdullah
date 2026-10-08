/* =========================================================
   Ghozi Abdullah — Portfolio
   Interaksi halaman (tanpa library):
   1. Animasi pembuka hero        6. Lightbox (klik gambar untuk diperbesar)
   2. Elemen muncul saat scroll   7. Buka/tutup "Details" yang halus
   3. Parallax kata besar         8. Angka statistik menghitung naik
   4. Navbar menempel + aktif     9. Tombol kembali ke atas
   5. Menu HP                    10. Kartu hero miring mengikuti kursor
   ========================================================= */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* 1. Animasi pembuka ------------------------------------ */
  const start = () => requestAnimationFrame(() => root.classList.add('is-loaded'));
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 700))]).then(start);
  } else {
    start();
  }

  /* 2. Muncul saat scroll --------------------------------- */
  const revealTargets = [
    '.hero__intro', '.hero__social', '.stat',
    '.about__hello', '.about__text p', '.about__col',
    '.tile', '.project__media', '.project__info',
    '.big-heading', '.xp__item',
    '.org-card', '.vol__title', '.vol__list li', '.certs__row figure',
    '.contact__lead', '.contact__list li'
  ];
  if (!reduce && 'IntersectionObserver' in window) {
    const els = $$(revealTargets.join(','));
    els.forEach(el => {
      el.classList.add('reveal');
      // jeda bertahap untuk elemen yang bersebelahan
      const siblings = [...el.parentElement.children].filter(c => c.matches(revealTargets.join(',')));
      el.style.setProperty('--d', (siblings.indexOf(el) % 4) * 90 + 'ms');
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* 3. Parallax kata besar + putaran kelopak --------------- */
  const parallax = [
    ['.about__word', -0.16, 160],
    ['.portfolio__word', 0.1, 90],
    ['.big-heading', -0.08, 70]
  ].flatMap(([sel, speed, max]) => $$(sel).map(el => ({ el, speed, max })));
  const burst = $('.burst');
  const stage = $('.about__stage');
  const tiles = $('.tiles');

  const offsetFromCenter = el => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2 - window.innerHeight / 2;
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const updateParallax = () => {
    parallax.forEach(({ el, speed, max }) => {
      const v = clamp(offsetFromCenter(el) * speed, -max, max);
      el.style.setProperty('--px', v.toFixed(1) + 'px');
    });
    if (burst && stage) {
      burst.style.setProperty('--rot', (offsetFromCenter(stage) * -0.05).toFixed(2) + 'deg');
    }
    if (tiles) {
      tiles.style.setProperty('--ty', clamp(offsetFromCenter(tiles) * 0.06, -40, 40).toFixed(1) + 'px');
    }
  };

  /* 4. Navbar menempel, sembunyi saat scroll turun --------- */
  const nav = $('.nav');
  const toTop = $('.to-top');
  let lastY = window.scrollY;

  const updateNav = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 10);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (!nav.classList.contains('is-open')) {
      if (goingDown && y > 240) nav.classList.add('is-hidden');
      else if (goingUp || y < 240) nav.classList.remove('is-hidden');
    }
    if (toTop) toTop.classList.toggle('is-visible', y > window.innerHeight * 0.9);
    lastY = y;
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateNav();
      if (!reduce) updateParallax();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // tandai menu yang sedang dibaca
  const navLinks = $$('.nav > .nav__links a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* 5. Menu HP -------------------------------------------- */
  const toggle = $('.nav__toggle');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (open) nav.classList.remove('is-hidden');
    });
    navLinks.forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', e => { if (!nav.contains(e.target)) closeMenu(); });
  }

  /* 6. Lightbox ------------------------------------------- */
  const zoomSelector = [
    '.project__media img:not(.devices__tablet):not(.devices__phone)',
    '.xp__photos img', '.org-card img', '.vol__list img', '.certs__row img'
  ].join(',');
  const groupSelector = '.projects, .xp, .org__grid, .vol__list, .certs__row';
  const zoomables = $$(zoomSelector).filter(img => !img.closest('.gallery-extra'));

  const captionFor = img => {
    if (img.dataset.caption) return img.dataset.caption;
    const fig = img.closest('figure');
    const cap = fig && fig.querySelector('figcaption');
    if (cap) return cap.textContent.trim();
    const card = img.closest('li, article');
    const title = card && card.querySelector('.vol__role, h3');
    if (title) {
      const meta = card.querySelector('.vol__list .muted, .org-card__meta');
      return title.textContent.trim() + (meta ? ' — ' + meta.textContent.trim().split('.')[0] : '');
    }
    return img.alt || '';
  };

  const lb = document.createElement('dialog');
  lb.className = 'lightbox';
  lb.setAttribute('aria-label', 'Image viewer');
  lb.innerHTML = `
    <figure class="lightbox__stage">
      <img class="lightbox__img" alt="">
      <figcaption class="lightbox__cap"><span class="lightbox__text"></span><span class="lightbox__count"></span></figcaption>
    </figure>
    <button class="lightbox__btn lightbox__close" type="button" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    <button class="lightbox__btn lightbox__prev" type="button" aria-label="Previous image"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
    <button class="lightbox__btn lightbox__next" type="button" aria-label="Next image"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>`;
  document.body.appendChild(lb);

  const lbImg = $('.lightbox__img', lb);
  const lbText = $('.lightbox__text', lb);
  const lbCount = $('.lightbox__count', lb);
  const lbPrev = $('.lightbox__prev', lb);
  const lbNext = $('.lightbox__next', lb);
  let group = [];
  let index = 0;
  let opener = null;

  const show = i => {
    index = (i + group.length) % group.length;
    const img = group[index];
    lbImg.classList.remove('is-in');
    const src = img.currentSrc || img.src;
    const done = () => requestAnimationFrame(() => lbImg.classList.add('is-in'));
    setTimeout(() => {
      lbImg.onload = done;
      lbImg.src = src;
      lbImg.alt = img.alt;
      if (lbImg.complete) done();
    }, lbImg.getAttribute('src') ? 140 : 0);
    lbText.textContent = captionFor(img);
    lbCount.textContent = group.length > 1 ? `${index + 1} / ${group.length}` : '';
    lbPrev.hidden = lbNext.hidden = group.length < 2;
  };

  // satu galeri = semua foto yang bisa diklik + foto tambahan (.gallery-extra) di wadah yang sama
  const openLightbox = (img, opener_ = img) => {
    const container = img.closest('[data-gallery]') || img.closest(groupSelector);
    group = container ? $$('img.zoomable, .gallery-extra img', container) : [img];
    opener = opener_;
    lbImg.removeAttribute('src');
    root.classList.add('lb-open');
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    show(group.indexOf(img));
  };

  const closeLightbox = () => {
    if (lb.open && typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open');
  };
  lb.addEventListener('close', () => {
    root.classList.remove('lb-open');
    if (opener) opener.focus({ preventScroll: true });
  });

  zoomables.forEach(img => {
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Open image: ' + (captionFor(img) || 'photo'));
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); }
    });
  });

  // tombol "+N photos" langsung membuka foto tambahan pertama
  $$('.gallery-badge').forEach(btn => {
    const card = btn.closest('[data-gallery]');
    const first = card && $('.gallery-extra img', card);
    if (!first) return;
    btn.setAttribute('aria-label', 'See ' + btn.textContent.trim() + ' of ' + captionFor($('img.zoomable', card) || first));
    btn.addEventListener('click', () => openLightbox(first, btn));
  });

  $('.lightbox__close', lb).addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => show(index - 1));
  lbNext.addEventListener('click', () => show(index + 1));
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.classList.contains('lightbox__stage')) closeLightbox();
  });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  // geser kiri/kanan di HP
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null || group.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* 7. Buka/tutup "Details" yang halus --------------------- */
  $$('.xp details').forEach(details => {
    const summary = $('summary', details);
    const body = $('.xp__body', details);
    if (!summary || !body || reduce || !body.animate) return;
    let anim = null;

    summary.addEventListener('click', e => {
      e.preventDefault();
      if (anim) return;
      const padBottom = getComputedStyle(body).paddingBottom;
      body.style.overflow = 'hidden';

      if (!details.open) {
        details.open = true;
        const h = body.offsetHeight;
        anim = body.animate(
          [{ height: '0px', paddingBottom: '0px', opacity: 0 }, { height: h + 'px', paddingBottom: padBottom, opacity: 1 }],
          { duration: 550, easing: 'cubic-bezier(.16, 1, .3, 1)' }
        );
        anim.onfinish = () => { body.style.overflow = ''; anim = null; };
      } else {
        const h = body.offsetHeight;
        anim = body.animate(
          [{ height: h + 'px', paddingBottom: padBottom, opacity: 1 }, { height: '0px', paddingBottom: '0px', opacity: 0 }],
          { duration: 380, easing: 'cubic-bezier(.5, 0, .75, 0)' }
        );
        anim.onfinish = () => { details.open = false; body.style.overflow = ''; anim = null; };
      }
    });
  });

  /* 8. Angka statistik menghitung naik --------------------- */
  if (!reduce && 'IntersectionObserver' in window) {
    $$('.count').forEach(el => {
      const to = Number(el.dataset.to);
      const suffix = el.dataset.suffix || '';
      el.textContent = '0' + suffix;
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = now => {
          const p = Math.min(1, (now - t0) / 1600);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(to * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), 500);
      });
      io.observe(el);
    });
  }

  /* 11. Kata "analyst" di footer: huruf naik lalu bergelombang */
  const footerWord = $('.footer__word');
  if (footerWord && !reduce) {
    const text = footerWord.textContent.trim();
    footerWord.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.style.setProperty('--i', i);
      span.textContent = ch;
      footerWord.appendChild(span);
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { footerWord.classList.add('is-in'); io.disconnect(); }
      }, { threshold: 0.2 });
      io.observe(footerWord);
    } else {
      footerWord.classList.add('is-in');
    }
  }

  /* 10. Kartu hero miring mengikuti kursor ----------------- */
  const card = $('.hero__card');
  if (card && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }
})();
