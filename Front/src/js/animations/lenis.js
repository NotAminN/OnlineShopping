/* ============================================================
   lenis.js — smooth scrolling synchronized with GSAP/ScrollTrigger
   ============================================================ */
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reducedMotion } from './gsap.js';

let lenis = null;

export function initLenis() {
  if (reducedMotion() || lenis) return lenis;
  lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.6,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollToTarget(selectorOrEl, offset = 0) {
  const el =
    typeof selectorOrEl === 'string'
      ? document.querySelector(selectorOrEl)
      : selectorOrEl;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.2 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function scrollToTop(instant = false) {
  if (lenis) lenis.scrollTo(0, { immediate: instant, duration: instant ? 0 : 1 });
  else window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' });
}
