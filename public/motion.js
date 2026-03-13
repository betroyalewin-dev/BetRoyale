/* motion.js — parallax scrolling + microinteractions — BetRoyale landing page */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isDesktop() {
    return window.matchMedia('(min-width: 901px)').matches;
  }

  /* ── Scroll Progress Bar ───────────────────────────────────────────────────*/
  var progressBar = document.getElementById('scroll-progress');

  function updateScrollProgress() {
    if (!progressBar) return;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ── Parallax ──────────────────────────────────────────────────────────────*/
  var orb1 = document.querySelector('.orb-1');
  var orb2 = document.querySelector('.orb-2');
  var heroProgressCard = document.querySelector('.hero-progress-card');
  var heroEl = document.querySelector('.hero');

  function updateParallax() {
    if (!isDesktop() || prefersReducedMotion) return;
    var sy = window.scrollY;

    // Use CSS `translate` property so it composites with the floatOrb
    // keyframe animation (which uses `transform`) without overriding it.
    if (orb1) orb1.style.translate = '0 ' + (sy * 0.15) + 'px';
    if (orb2) orb2.style.translate = '0 ' + (sy * -0.10) + 'px';

    // Hero progress card drifts slightly slower than the page — depth effect.
    // Stops once the hero section has fully scrolled past.
    if (heroProgressCard && heroEl) {
      var heroBottom = heroEl.getBoundingClientRect().bottom;
      if (heroBottom > 0) {
        heroProgressCard.style.transform = 'translateY(' + (sy * 0.06) + 'px)';
      } else {
        heroProgressCard.style.transform = '';
      }
    }
  }

  /* ── Nav Scroll Shrink ─────────────────────────────────────────────────────*/
  var nav = document.querySelector('.menu');

  function updateNavShrink() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }

  /* ── Unified scroll handler (rAF-throttled) ────────────────────────────────*/
  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateScrollProgress();
        if (!prefersReducedMotion) {
          updateParallax();
          updateNavShrink();
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial paint
  updateScrollProgress();
  if (!prefersReducedMotion) updateNavShrink();

  /* ── Scroll Reveal (Intersection Observer) ─────────────────────────────────*/
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll(
      '.signal-card, .payout-step, .faq-item, .auth-trust-item, .auth-footer-item'
    );

    revealEls.forEach(function (el) {
      // Stagger siblings of the same tag within their parent
      var siblings = Array.from(el.parentElement.children).filter(function (c) {
        return c.tagName === el.tagName;
      });
      var idx = siblings.indexOf(el);
      el.classList.add('reveal-hidden');
      el.style.transitionDelay = (idx * 80) + 'ms';
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-hidden');
            entry.target.classList.add('reveal-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ── Button Ripple ─────────────────────────────────────────────────────────*/
  function attachRipple(btn) {
    btn.addEventListener('click', function (e) {
      if (prefersReducedMotion) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2;
      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  }

  document.querySelectorAll(
    '.hero-action-primary, .hero-action-secondary, #auth-signup-btn, #hero-signup-btn'
  ).forEach(attachRipple);

  /* ── Magnetic CTA (desktop only) ───────────────────────────────────────────*/
  if (!prefersReducedMotion) {
    document.querySelectorAll('.hero-action-primary').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        if (!isDesktop()) return;
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) * 0.28;
        var dy = (e.clientY - cy) * 0.28;
        btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

})();
