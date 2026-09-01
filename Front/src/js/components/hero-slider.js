/* ============================================================
   hero-slider.js — full-width cinematic hero slider (GSAP)
   Autoplay + progress, pause-on-hover, swipe, RTL-aware arrows.
   ============================================================ */
import { gsap, reducedMotion } from '../animations/gsap.js';
import { HERO_SLIDES } from '../data/home-content.js';
import { icon, guardImage } from '../utils/helpers.icons.js';

const AUTOPLAY_MS = 6000;
const fa = (n) => new Intl.NumberFormat('fa-IR').format(n);

export function renderHeroSlider(mount) {
  if (!mount) return null;

  mount.className = 'hero';
  mount.setAttribute('role', 'region');
  mount.setAttribute('aria-roledescription', 'اسلایدر');
  mount.setAttribute('aria-label', 'کمپین‌های ویژه');

  mount.innerHTML = `
    <div class="hero-track" data-hero-track>
      ${HERO_SLIDES.map(
        (s, i) => `
        <article class="hero-slide${i === 0 ? ' active' : ''}" data-slide="${i}"
          role="group" aria-label="اسلاید ${fa(i + 1)} از ${fa(HERO_SLIDES.length)}"
          ${i === 0 ? '' : 'aria-hidden="true"'}>
          <div class="hero-img-wrap img-frame grain">
            <img src="${s.image}" alt="${s.title}" fetchpriority="${i === 0 ? 'high' : 'low'}"
              loading="${i === 0 ? 'eager' : 'lazy'}" />
          </div>
          <div class="hero-scrim"></div>
          <div class="container-x hero-body">
            <div class="hero-copy">
              <p class="hero-label">${s.label}</p>
              <h1 class="hero-title">${s.title}</h1>
              <p class="hero-subtitle">${s.subtitle}</p>
              <a class="btn btn-light btn-lg hero-cta" href="${s.cta.href}">
                ${s.cta.label} ${icon('arrow-end', 18)}
              </a>
            </div>
          </div>
        </article>`,
      ).join('')}
    </div>

    <div class="container-x hero-ui">
      <div class="hero-pagination" data-hero-dots role="tablist" aria-label="انتخاب اسلاید">
        ${HERO_SLIDES.map(
          (_, i) => `
          <button type="button" class="hero-dot${i === 0 ? ' active' : ''}" data-dot="${i}"
            role="tab" aria-selected="${i === 0}" aria-label="اسلاید ${fa(i + 1)}"></button>`,
        ).join('')}
      </div>
    </div>

    <div class="hero-progress"><span data-progress></span></div>`;

  /* ---------- internals ---------- */
  const slides = [...mount.querySelectorAll('.hero-slide')];
  const dots = [...mount.querySelectorAll('[data-dot]')];
  const progressBar = mount.querySelector('[data-progress]');
  let index = 0;
  let autoplayTween = null;
  let paused = false;

  function animateIn(slide) {
    const items = slide.querySelectorAll('.hero-label, .hero-title, .hero-subtitle, .hero-cta');
    if (reducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      items,
      { opacity: 0, y: 34 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.09,
        delay: 0.15,
        ease: 'power3.out',
        clearProps: 'transform',
      },
    );
    /* subtle image scale-settle */
    gsap.fromTo(
      slide.querySelector('img'),
      { scale: 1.08 },
      { scale: 1, duration: 2.4, ease: 'power2.out' },
    );
  }

  function goTo(nextIdx, dir = 1) {
    if (nextIdx === index && slides[index].classList.contains('active')) return;
    const prevSlide = slides[index];
    const nextSlide = slides[(nextIdx + slides.length) % slides.length];
    index = (nextIdx + slides.length) % slides.length;

    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
      s.setAttribute('aria-hidden', String(i !== index));
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
      d.setAttribute('aria-selected', String(i === index));
    });

    if (!reducedMotion()) {
      gsap.to(prevSlide.querySelector('.hero-img-wrap'), {
        scale: 1.04,
        duration: 0.9,
        ease: 'power2.inOut',
      });
      gsap.fromTo(
        nextSlide,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => gsap.set(prevSlide, { autoAlpha: 0 }),
        },
      );
      gsap.fromTo(
        nextSlide.querySelector('.hero-img-wrap'),
        { scale: 1.02 },
        { scale: 1, duration: 1.6, ease: 'power2.out' },
      );
    }
    animateIn(nextSlide);
    restartProgress();
  }

  const next = () => goTo(index + 1, 1);
  const prev = () => goTo(index - 1, -1);  function restartProgress() {
    if (autoplayTween) autoplayTween.kill();
    if (reducedMotion() || paused) return;
    gsap.set(progressBar, { scaleX: 0, transformOrigin: 'right' });
    autoplayTween = gsap.to(progressBar, {
      scaleX: 1,
      duration: AUTOPLAY_MS / 1000,
      ease: 'none',
      onComplete: next,
    });
  }

  /* ---------- controls ---------- */
  dots.forEach((d) =>
    d.addEventListener('click', () => goTo(Number(d.dataset.dot))),
  );

  /* pause on hover */
  mount.addEventListener('mouseenter', () => {
    paused = true;
    autoplayTween?.pause();
  });
  mount.addEventListener('mouseleave', () => {
    paused = false;
    autoplayTween?.resume();
    if (!autoplayTween || autoplayTween.progress() === 1) restartProgress();
  });

  /* swipe */
  let startX = null;
  mount.addEventListener(
    'pointerdown',
    (e) => {
      startX = e.clientX;
    },
    { passive: true },
  );
  mount.addEventListener(
    'pointerup',
    (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 55) dx < 0 ? next() : prev();
      startX = null;
    },
    { passive: true },
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) autoplayTween?.pause();
    else if (!paused) autoplayTween?.resume();
  });

  /* init */
  slides.forEach((s) => {
    const img = s.querySelector('img');
    if (img) guardImage(img);
  });
  animateIn(slides[0]);
  restartProgress();

  return {
    destroy: () => autoplayTween?.kill(),
  };
}
