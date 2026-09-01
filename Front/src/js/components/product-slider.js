/* ============================================================
   product-slider.js â€” horizontal product carousel w/ arrows
   ============================================================ */
import { createProductCard } from './product-card.js';/**
 * createProductSlider({ id, eyebrow, title, href, linkLabel, products, headless })
 */
export function createProductSlider({
  id,
  eyebrow,
  title,
  href,
  linkLabel = 'ظ…ط´ط§ظ‡ط¯ظ‡ ظ‡ظ…ظ‡',
  products = [],
  headless = false,
}) {
  const section = document.createElement('section');
  section.className = 'section';
  if (id) section.id = id;
  if (headless) {
    section.classList.add('headless');
  }

  section.innerHTML = `
    <div class="container-x">
      ${
        headless
          ? ''
          : `<div class="section-head" data-reveal>
        <div>
          ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}
          <h2 class="display-2">${title}</h2>
        </div>
        <div class="section-actions" style="display:flex;align-items:center;gap:1rem">
          ${
            linkLabel
              ? `<a class="link-underline" href="${href}" style="color:var(--color-cobalt-500)">
            ${linkLabel}
          </a>`
              : ''
          }
          <div class="p-slider-nav" data-nav></div>
        </div>
      </div>`
      }
      <div class="${headless ? '' : ''}p-slider${headless ? ' sale-slider' : ''}" style="--ps-gap: clamp(0.9rem, 2vw, 1.6rem)" ${headless ? '' : 'data-reveal'}>
        <div class="p-slider-track" data-track></div>
      </div>
    </div>`;

  const track = section.querySelector('[data-track]');
  products.forEach((p) => {
    const slide = document.createElement('div');
    slide.className = 'p-slide';
    slide.appendChild(createProductCard(p));
    track.appendChild(slide);
  });

  /* arrows — RTL: content advances toward the LEFT physically */
  const nav = section.querySelector('[data-nav]');
  if (!nav) return section; /* headless mode: no section header, no nav arrows */
  const prevBtn = document.createElement('button'); /* points → , goes back */
  prevBtn.type = 'button';
  prevBtn.className = 'ps-btn';
  prevBtn.setAttribute('aria-label', 'ظ‚ط¨ظ„غŒ');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  const nextBtn = document.createElement('button'); /* points â†گ , advances */
  nextBtn.type = 'button';
  nextBtn.className = 'ps-btn';
  nextBtn.setAttribute('aria-label', 'ط¨ط¹ط¯غŒ');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  nav.append(prevBtn, nextBtn);

  /* RTL-aware scrolling: overflow extends to the left physically */
  const step = () => Math.max(track.clientWidth * 0.75, 260);
  prevBtn.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    const pos = Math.abs(track.scrollLeft);
    prevBtn.disabled = pos <= 2; /* at start edge (visually right) */
    nextBtn.disabled = pos >= maxScroll;
  };
  track.addEventListener('scroll', updateArrows, { passive: true });
  requestAnimationFrame(updateArrows);
  window.addEventListener('resize', updateArrows);

  return section;
}


