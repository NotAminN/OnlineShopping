/* ============================================================
   gsap.js — GSAP core registration + reusable motion utilities
   ============================================================ */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out', duration: 0.7 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* ---------- Motion utilities (fashion-editorial timing) ---------- */

export function fadeIn(target, vars = {}) {
  if (reducedMotion()) return gsap.set(target, { opacity: 1 });
  return gsap.fromTo(target, { opacity: 0 }, { opacity: 1, ...vars });
}

export function slideIn(target, dir = 'up', vars = {}) {
  const offset = 32;
  const from =
    dir === 'up'
      ? { y: offset }
      : dir === 'down'
        ? { y: -offset }
        : dir === 'start'
          ? { x: offset }
          : { x: -offset };
  if (reducedMotion()) return gsap.set(target, { opacity: 1, clearProps: 'x,y' });
  return gsap.from(target, {
    opacity: 0,
    ...from,
    ...vars,
    clearProps: 'transform',
  });
}

export function scaleIn(target, vars = {}) {
  if (reducedMotion()) return gsap.set(target, { opacity: 1, scale: 1 });
  return gsap.fromTo(
    target,
    { opacity: 0, scale: 0.96 },
    { opacity: 1, scale: 1, transformOrigin: '50% 50%', ...vars },
  );
}

export function stagger(targets, vars = {}, staggerEach = 0.08) {
  if (reducedMotion()) return gsap.set(targets, { opacity: 1 });
  return gsap.from(targets, {
    opacity: 0,
    y: 28,
    duration: 0.75,
    ease: 'power3.out',
    stagger: staggerEach,
    ...vars,
  });
}

/* Scroll-linked reveal for [data-reveal] elements inside a scope */
export function reveal(scope = document) {
  const els = scope.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  if (reducedMotion()) {
    els.forEach((el) => (el.style.opacity = '1'));
    return;
  }
  els.forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay || '0');
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        onComplete: () => {
          el.style.willChange = 'auto';
          el.style.transform = '';
        },
      },
    );
  });
}

/* Subtle parallax on an image inside an overflowing frame */
export function parallax(el, amount = 10) {
  if (!el || reducedMotion() || isTouch()) return;
  const img = el.querySelector('img');
  if (!img) return;
  gsap.set(img, { height: `${100 + amount}%`, top: `-${amount / 2}%` });
  gsap.to(img, {
    yPercent: -amount * 0.6,
    ease: 'none',
    scrollTrigger: {
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/* ---------- Overlay primitives ---------- */
export function modalOpen(overlay, panel) {
  lockBody();
  if (reducedMotion()) {
    gsap.set(overlay, { autoAlpha: 1 });
    return;
  }
  gsap
    .timeline()
    .set(overlay, { autoAlpha: 0 })
    .to(overlay, { autoAlpha: 1, duration: 0.3 })
    .fromTo(
      panel,
      { opacity: 0, y: 34, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' },
      '<0.05',
    );
}

export function modalClose(overlay, panel, onDone) {
  if (reducedMotion()) {
    gsap.set(overlay, { autoAlpha: 0 });
    unlockBody();
    onDone?.();
    return;
  }
  gsap
    .timeline({ onComplete: () => { unlockBody(); onDone?.(); } })
    .to(panel, { opacity: 0, y: 20, scale: 0.99, duration: 0.25, ease: 'power2.in' })
    .to(overlay, { autoAlpha: 0, duration: 0.25 }, '<0.05');
}

/* RTL-aware drawer: slides from the right edge by default */
export function drawerOpen(drawer, overlay) {
  lockBody();
  if (reducedMotion()) {
    gsap.set([overlay, drawer], { autoAlpha: 1, x: 0 });
    return;
  }
  gsap
    .timeline()
    .set(drawer, { xPercent: 100, autoAlpha: 1 })
    .set(overlay, { autoAlpha: 0 })
    .to(overlay, { autoAlpha: 1, duration: 0.3 }, 0)
    .to(drawer, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, 0);
}

export function drawerClose(drawer, overlay, onDone) {
  if (reducedMotion()) {
    gsap.set([overlay, drawer], { autoAlpha: 0 });
    unlockBody();
    onDone?.();
    return;
  }
  gsap
    .timeline({
      onComplete: () => {
        unlockBody();
        onDone?.();
      },
    })
    .to(drawer, { xPercent: 100, duration: 0.38, ease: 'power3.in' }, 0)
    .to(overlay, { autoAlpha: 0, duration: 0.3 }, '<0.08')
    .set(drawer, { autoAlpha: 0, xPercent: 0 });
}

/* ---------- Body scroll lock (works with or without Lenis) ---------- */
let locks = 0;
export function lockBody() {
  locks += 1;
  if (locks === 1) document.documentElement.classList.add('is-locked');
}
export function unlockBody() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.documentElement.classList.remove('is-locked');
}

/* Refresh triggers after dynamic DOM changes */
export function refreshTriggers() {
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
