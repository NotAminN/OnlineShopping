import { fetchApi } from '../api/client.js';
import { CATEGORIES, DEFAULT_CATEGORIES, FOOTER_SHOP_LINKS, MEGA_MENU } from '../data/categories.js';

function normalize(cat) {
  return { ...cat, id: cat.slug || cat.id };
}

export const categoryService = {
  async getCategories() {
    try {
      const data = await fetchApi(`/categories/`);
      const results = Array.isArray(data) ? data : data.results;
      if (results?.length) {
        CATEGORIES.splice(0, CATEGORIES.length, ...results.map(normalize));
      }
    } catch (e) {
      CATEGORIES.splice(0, CATEGORIES.length, ...DEFAULT_CATEGORIES);
    }
    return CATEGORIES;
  },

  async getAll() {
    return this.getCategories();
  },

  async getCategory(slug) {
    try {
      const cat = await fetchApi(`/categories/${slug}/`);
      return normalize(cat);
    } catch(e) {
      return CATEGORIES.find((c) => c.slug === slug) || null;
    }
  },

  async getFooterLinks() {
    return FOOTER_SHOP_LINKS;
  },

  getMegaMenu() {
    return MEGA_MENU; // From static data since DB doesn't have this structure yet
  }
};

export const collectionService = {
  async getAll() {
    // In a real app this would fetch from /api/collections/
    return [];
  }
};

export const shippingService = {
  async getMethods() {
    return [];
  }
};
