/* ============================================================
   home.js — homepage composition
   ============================================================ */
import { renderHeroSlider } from '../components/hero-slider.js';
import { renderHomeSections } from '../components/home-sections.js';

export function init() {
  const heroMount = document.getElementById('hero-root');
  const contentMount = document.getElementById('home-content');
  renderHeroSlider(heroMount);
  renderHomeSections(contentMount);
}
