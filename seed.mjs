import { CATEGORIES } from './Front/src/js/data/categories.js';
import { PRODUCTS } from './Front/src/js/data/products.js';
import fs from 'fs';

const data = {
  categories: CATEGORIES,
  products: PRODUCTS
};

fs.writeFileSync('seed_data.json', JSON.stringify(data, null, 2));
console.log('Seed data extracted.');
