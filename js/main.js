/* ============================================================
   Five Star Exotic Cars — Interactions
   ============================================================ */
(function () {
  'use strict';

  /* --- Navbar: shrink/darken on scroll --- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Mobile menu toggle --- */
  const toggle = document.getElementById('navToggle');
  const nav = document.querySelector('.nav');
  const closeMenu = () => { toggle.classList.remove('open'); nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', closeMenu));

  /* --- Scroll reveal --- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.05 });
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('visible'));
  }

  /* --- Flyer modal (only if these elements exist) --- */
  const trigger = document.getElementById('posterTrigger');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');

  if (trigger && modal && modalClose) {
  const openModal = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  };
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  }

  /* --- Background: mouse parallax + cursor light + scroll effect --- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const media = document.querySelector('.hero__media');
  const heroContent = document.querySelector('.hero__content');

  // Parallax/zoom only on devices with a real mouse — avoids extra cropping on touch
  if (!prefersReduced && canHover && media) {
    const root = document.documentElement;
    let tx = 0, ty = 0, cx = 0, cy = 0;                                   // parallax target/current
    let gx = window.innerWidth / 2, gy = window.innerHeight * 0.4;        // light target
    let cgx = gx, cgy = gy;                                               // light current
    let sy = window.scrollY;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      gx = e.clientX; gy = e.clientY;
    }, { passive: true });
    window.addEventListener('scroll', () => { sy = window.scrollY; }, { passive: true });

    const tick = () => {
      // smoothing (lerp)
      cx += (tx - cx) * 0.06;  cy += (ty - cy) * 0.06;
      cgx += (gx - cgx) * 0.10; cgy += (gy - cgy) * 0.10;

      const vh = window.innerHeight || 800;
      const s = Math.min(sy / vh, 1);                 // 0..1 (first screen)

      // video: mouse parallax + scroll zoom/shift
      const zoom = 1.12 + s * 0.05;
      const px = cx * 26;
      const py = cy * 26 - s * vh * 0.05;
      media.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${zoom})`;

      // content: slight counter-parallax + fade on scroll
      if (heroContent) {
        heroContent.style.transform = `translate3d(${cx * -12}px, ${cy * -12}px, 0)`;
        heroContent.style.opacity = String(Math.max(0, 1 - s * 1.15));
      }

      // cursor light
      root.style.setProperty('--mx', cgx + 'px');
      root.style.setProperty('--my', cgy + 'px');

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* --- Seamless loop: crossfade between two videos (no hard cut / black flash) --- */
  const vidA = document.querySelector('.hero__video--a');
  const vidB = document.querySelector('.hero__video--b');
  if (vidA && vidB) {
    const FADE = 0.6;                 // crossfade duration (s) — same as CSS transition
    const vids = [vidA, vidB];
    let active = 0;
    let swapping = false;
    vidA.muted = true; vidB.muted = true;   // ensure muted so mobile autoplay is allowed

    // Pre-warm the second video so its first frame is ready (prevents black flash)
    vidB.play().then(() => { vidB.pause(); try { vidB.currentTime = 0; } catch (_) {} }).catch(() => {});
    // Rewind the finished video so it's instantly ready for reuse
    vids.forEach((v) => v.addEventListener('ended', () => { try { v.currentTime = 0; } catch (_) {} }));

    vidA.play().catch(() => {});
    // Mobile/iOS fallback: start playback on the first user interaction if autoplay was blocked
    const kick = () => { const v = vids[active]; if (v && v.paused) v.play().catch(() => {}); };
    document.addEventListener('touchstart', kick, { once: true, passive: true });
    document.addEventListener('click', kick, { once: true });

    const onTime = (e) => {
      const v = e.target;
      if (v !== vids[active] || swapping) return;     // only the active video triggers
      const d = v.duration;
      if (!d || isNaN(d)) return;
      if (d - v.currentTime <= FADE) {
        swapping = true;
        const next = vids[1 - active];
        try { next.currentTime = 0; } catch (_) {}
        const p = next.play();
        // Start the crossfade only when the new video's FIRST frame is on screen
        const reveal = () => {
          next.style.opacity = '1';
          v.style.opacity = '0';
          active = 1 - active;
          swapping = false;
        };
        if (typeof next.requestVideoFrameCallback === 'function') {
          next.requestVideoFrameCallback(() => reveal());
        } else if (p && typeof p.then === 'function') {
          p.then(reveal).catch(reveal);
        } else {
          reveal();
        }
      }
    };
    vidA.addEventListener('timeupdate', onTime);
    vidB.addEventListener('timeupdate', onTime);
  }

  /* --- Application form: success message on submit (no backend) --- */
  const wForm = document.getElementById('waiverForm');
  const wSuccess = document.getElementById('waiverSuccess');
  if (wForm && wSuccess) {
    wForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!wForm.checkValidity()) { wForm.reportValidity(); return; }
      wForm.setAttribute('hidden', '');
      wSuccess.removeAttribute('hidden');
      wSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* --- Signature pads (drawable) --- */
  document.querySelectorAll('.sigpad').forEach((pad) => {
    const canvas = pad.querySelector('.sigpad__canvas');
    const clearBtn = pad.querySelector('.sigpad__clear');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const setup = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width; canvas.height = r.height;
      ctx.strokeStyle = '#f5d98a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    };
    setup();
    window.addEventListener('resize', setup);
    let drawing = false;
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    };
    const start = (e) => { drawing = true; const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); };
    const move = (e) => { if (!drawing) return; const p = point(e); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); };
    const end = () => { drawing = false; };
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
    if (clearBtn) clearBtn.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
  });

  /* --- Product page: gallery, variant, quantity, add to cart --- */
  const productMain = document.getElementById('productMain');
  const thumbs = document.getElementById('productThumbs');
  if (productMain && thumbs) {
    thumbs.querySelectorAll('.product__thumb').forEach((t) => {
      t.addEventListener('click', () => {
        const img = t.querySelector('img');
        if (!img) return;
        productMain.src = img.src;
        thumbs.querySelectorAll('.product__thumb').forEach((x) => x.classList.remove('active'));
        t.classList.add('active');
      });
    });
  }

  const hatOptions = document.getElementById('hatOptions');
  if (hatOptions) {
    hatOptions.querySelectorAll('.opt').forEach((o) => {
      o.addEventListener('click', () => {
        hatOptions.querySelectorAll('.opt').forEach((x) => x.classList.remove('active'));
        o.classList.add('active');
      });
    });
  }

  const qtyInput = document.getElementById('qty');
  document.querySelectorAll('.qty button[data-step]').forEach((b) => {
    b.addEventListener('click', () => {
      if (!qtyInput) return;
      const v = Math.max(1, (parseInt(qtyInput.value, 10) || 1) + parseInt(b.dataset.step, 10));
      qtyInput.value = v;
    });
  });

  const addToCart = document.getElementById('addToCart');
  const toast = document.getElementById('toast');
  if (addToCart && toast) {
    let toastTimer;
    addToCart.addEventListener('click', () => {
      const opt = document.querySelector('#hatOptions .opt.active');
      const variant = opt ? opt.textContent.trim() : '';
      const q = qtyInput ? qtyInput.value : 1;
      toast.innerHTML = `Added to cart: <b>${variant}</b> × ${q}`;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    });
  }

  const buyNow = document.getElementById('buyNow');
  if (buyNow && toast) {
    let buyTimer;
    buyNow.addEventListener('click', () => {
      toast.innerHTML = 'Redirecting to secure checkout… <b>(demo)</b>';
      toast.classList.add('show');
      clearTimeout(buyTimer);
      buyTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    });
  }

  /* --- Event calendar --- */
  const calGrid = document.getElementById('calGrid');
  if (calGrid) {
    const EVENTS = [
      { date: '2026-06-04', name: 'Atlantic City Rally — Sticker Night', time: 'Evening', desc: 'Sticker Night kickoff for the Atlantic City Rally 2026.' },
      { date: '2026-06-06', name: 'Atlantic City Rally — Rally Day', time: 'All day · Rain or Shine', desc: "Cruise to Atlantic City, then Harrah's The Pool After Dark Party. Gordon Ramsay Steak at 7:00PM." },
    ];
    const calMonth = document.getElementById('calMonth');
    const calDow = document.getElementById('calDow');
    const eventsList = document.getElementById('calEventsList');
    const eventsTitle = document.getElementById('calEventsTitle');
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    DOW.forEach((d) => { const el = document.createElement('div'); el.className = 'calendar__dow'; el.textContent = d; calDow.appendChild(el); });

    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const view = new Date(today.getFullYear(), today.getMonth(), 1);
    let selected = null;

    const eventsOn = (str) => EVENTS.filter((e) => e.date === str);

    function renderEvents(filter) {
      const list = filter ? eventsOn(filter) : [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
      eventsTitle.textContent = filter ? 'Events on this day' : 'Upcoming Events';
      if (!list.length) { eventsList.innerHTML = '<p class="cal-empty">No events on this day.</p>'; return; }
      eventsList.innerHTML = list.map((e) => {
        const d = new Date(e.date + 'T00:00:00');
        const ds = `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        return `<div class="event-item ${filter ? 'is-active' : ''}">
          <div class="event-item__date">${ds}</div>
          <div class="event-item__name">${e.name}</div>
          <div class="event-item__time">🕒 ${e.time}</div>
          <div class="event-item__desc">${e.desc}</div>
        </div>`;
      }).join('');
    }

    function render() {
      const y = view.getFullYear(), m = view.getMonth();
      calMonth.textContent = `${MONTHS[m]} ${y}`;
      calGrid.innerHTML = '';
      const first = new Date(y, m, 1).getDay();
      const days = new Date(y, m + 1, 0).getDate();
      for (let i = 0; i < first; i++) { const c = document.createElement('div'); c.className = 'cal-day empty'; calGrid.appendChild(c); }
      for (let d = 1; d <= days; d++) {
        const str = `${y}-${pad(m + 1)}-${pad(d)}`;
        const c = document.createElement('div');
        c.className = 'cal-day';
        c.textContent = d;
        if (str === todayStr) c.classList.add('today');
        if (eventsOn(str).length) {
          c.classList.add('has-event');
          if (str === selected) c.classList.add('selected');
          c.addEventListener('click', () => { selected = str; renderEvents(str); render(); });
        }
        calGrid.appendChild(c);
      }
    }

    const calPrev = document.getElementById('calPrev');
    const calNext = document.getElementById('calNext');
    if (calPrev) calPrev.addEventListener('click', () => { view.setMonth(view.getMonth() - 1); selected = null; render(); });
    if (calNext) calNext.addEventListener('click', () => { view.setMonth(view.getMonth() + 1); selected = null; render(); });

    render();
    renderEvents(null);
  }

  /* --- Store info toggle --- */
  document.querySelectorAll('.product__pickup-link').forEach((link) => {
    const info = link.parentElement.querySelector('.product__store-info');
    if (!info) return;
    link.addEventListener('click', () => {
      const open = info.hasAttribute('hidden');
      if (open) { info.removeAttribute('hidden'); link.textContent = 'Hide store information'; }
      else { info.setAttribute('hidden', ''); link.textContent = 'View store information'; }
      link.setAttribute('aria-expanded', String(open));
    });
  });

})();
