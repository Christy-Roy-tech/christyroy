/*==========================================================
  CHRISTY ROY PORTFOLIO — script.js
  
  KEY NAV FIX: We never use display:none on the overlay.
  GSAP cannot animate elements that are display:none.
  Instead we toggle .is-open class which switches
  visibility/pointer-events, and GSAP animates the panels.
==========================================================*/
document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────────────────
     CUSTOM CURSOR (desktop / pointer devices only)
  ──────────────────────────────────────────────── */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  // Only run cursor logic on devices that support hover
  const isPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isPointer && cursor && follower) {
    let mx = -100, my = -100;
    let fx = -100, fy = -100;
    let rafId;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    const tickFollower = () => {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      rafId = requestAnimationFrame(tickFollower);
    };
    rafId = requestAnimationFrame(tickFollower);

    // Hover expand
    const hoverEls = document.querySelectorAll(
      'a, button, .stag, .cert-card, .proj-img-wrap, input, textarea, select, label'
    );
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => follower.classList.add('hov'));
      el.addEventListener('mouseleave', () => follower.classList.remove('hov'));
    });
  }


  /* ────────────────────────────────────────────────
     SCROLL PROGRESS BAR
  ──────────────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0 && progressBar) {
      progressBar.style.width = (window.scrollY / max * 100) + '%';
    }
  };
  window.addEventListener('scroll', updateProgress, { passive: true });


  /* ────────────────────────────────────────────────
     STICKY HEADER
  ──────────────────────────────────────────────── */
  const header = document.getElementById('header');
  const handleHeaderScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // run once on load


  /* ────────────────────────────────────────────────
     KINETIC FULLSCREEN NAV OVERLAY
     
     The overlay is always in DOM (visibility:hidden).
     .is-open makes it visibility:visible + pointer-events:all.
     GSAP animates the three panels + links + footer.
  ──────────────────────────────────────────────── */
  const overlay    = document.getElementById('nav-overlay');
  const menuBtn    = document.getElementById('menu-toggle');
  const panels     = overlay ? overlay.querySelectorAll('.nav-overlay__panel') : [];
  const navLinks   = overlay ? overlay.querySelectorAll('.nav-overlay__link') : [];
  const navFooter  = overlay ? overlay.querySelector('.nav-overlay__footer') : null;
  const navItems   = overlay ? overlay.querySelectorAll('.nav-overlay__item') : [];

  let menuOpen  = false;
  let menuAnim  = null; // current timeline so we can kill it cleanly

  // Set the initial state that GSAP will animate FROM
  const initNavState = () => {
    if (!overlay) return;
    gsap.set(panels,    { xPercent: 106 });
    gsap.set(navLinks,  { yPercent: 120, opacity: 0, rotate: 6 });
    gsap.set(navFooter, { y: 30, opacity: 0 });
  };
  initNavState();

  const openMenu = () => {
    if (menuOpen) return;
    menuOpen = true;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    if (menuBtn) menuBtn.classList.add('active');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (menuAnim) menuAnim.kill();
    menuAnim = gsap.timeline();
    menuAnim
      .to(panels, {
        xPercent: 0,
        stagger: 0.065,
        duration: 0.52,
        ease: 'power3.out'
      })
      .to(navLinks, {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3')
      .to(navFooter, {
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: 'power2.out'
      }, '-=0.35');
  };

  const closeMenu = () => {
    if (!menuOpen) return;
    menuOpen = false;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (menuBtn) menuBtn.classList.remove('active');
    document.body.style.overflow = '';

    // Reset all active shapes
    overlay.querySelectorAll('.nav-shape').forEach(s => s.classList.remove('active'));

    if (menuAnim) menuAnim.kill();
    menuAnim = gsap.timeline({
      onComplete: () => {
        overlay.classList.remove('is-open');
        // Reset for next open
        initNavState();
      }
    });
    menuAnim
      .to(navLinks, {
        yPercent: 30, opacity: 0, rotate: 4,
        stagger: { each: 0.03, from: 'end' },
        duration: 0.25, ease: 'power2.in'
      })
      .to(navFooter, { opacity: 0, y: 15, duration: 0.2, ease: 'power2.in' }, '<')
      .to(panels, {
        xPercent: 106,
        stagger: { each: 0.05, from: 'end' },
        duration: 0.45,
        ease: 'power3.in'
      }, '-=0.15');
  };

  if (menuBtn) menuBtn.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());

  // Close on nav link click (smooth scroll to section)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // Shape hover effects (desktop only — uses mouseenter)
  if (isPointer) {
    navItems.forEach(item => {
      const key   = item.getAttribute('data-shape');
      const shape = overlay ? overlay.querySelector(`.shape-${key}`) : null;
      if (!shape) return;
      const els = shape.querySelectorAll('.s-el');

      item.addEventListener('mouseenter', () => {
        overlay.querySelectorAll('.nav-shape').forEach(s => s.classList.remove('active'));
        shape.classList.add('active');
        gsap.fromTo(els,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.04, duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' }
        );
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(els, {
          scale: 0.7, opacity: 0, duration: 0.22,
          ease: 'power2.in', overwrite: 'auto',
          onComplete: () => shape.classList.remove('active')
        });
      });
    });
  }


  /* ────────────────────────────────────────────────
     HERO ENTRANCE ANIMATIONS (one-time on load)
  ──────────────────────────────────────────────── */
  const heroTL = gsap.timeline({ delay: 0.1 });
  heroTL
    .from('.hero-eyebrow',    { opacity: 0, y: 18,  duration: 0.75, ease: 'power3.out' })
    .from('.name-first',      { opacity: 0, y: 60,  duration: 0.9,  ease: 'power3.out' }, '-=0.4')
    .from('.name-last',       { opacity: 0, y: 60,  duration: 0.9,  ease: 'power3.out' }, '-=0.75')
    .from('.hero-tagline',    { opacity: 0, y: 26,  duration: 0.7,  ease: 'power3.out' }, '-=0.55')
    .from('.hero-ctas',       { opacity: 0, y: 20,  duration: 0.65, ease: 'power3.out' }, '-=0.5')
    .from('.hero-stats',      { opacity: 0, y: 16,  duration: 0.6,  ease: 'power3.out' }, '-=0.45')
    .from('.hero-photo-wrap', { opacity: 0, x: 45,  duration: 0.95, ease: 'power3.out' }, '-=0.9')
    .from('.hero-terminal',   { opacity: 0, y: 30,  duration: 0.7,  ease: 'power3.out' }, '-=0.65');


  /* ────────────────────────────────────────────────
     SCROLL REVEAL (Intersection Observer)
  ──────────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.anim').forEach(el => revealObserver.observe(el));


  /* ────────────────────────────────────────────────
     ACTIVE NAV LINK on scroll (header-less, overlay nav)
  ──────────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const scrollActive = () => {
    const scrollY = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(sec => {
      const id   = sec.getAttribute('id');
      const top  = sec.offsetTop;
      const bot  = top + sec.offsetHeight;
      const link = overlay ? overlay.querySelector(`.nav-overlay__link[href="#${id}"]`) : null;
      if (link) link.classList.toggle('nav-link--active', scrollY >= top && scrollY < bot);
    });
  };
  window.addEventListener('scroll', scrollActive, { passive: true });


  /* ────────────────────────────────────────────────
     CONTACT FORM — async Formspree submission
  ──────────────────────────────────────────────── */
  const form      = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');

  if (form && submitBtn && successEl) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending…</span> <i class="fa-solid fa-circle-notch fa-spin"></i>';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          successEl.classList.add('show');
          submitBtn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>';
          setTimeout(() => successEl.classList.remove('show'), 7000);
        } else {
          throw new Error('Send failed');
        }
      } catch {
        submitBtn.innerHTML = '<span>Failed — Try Again</span>';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

});