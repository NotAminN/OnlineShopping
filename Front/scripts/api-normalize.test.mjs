import { normalizeProduct } from '../src/js/services/products.js';

const API = 'http://127.0.0.1:8000/api/products/?page=1';
const res = await fetch(API);
const data = await res.json();
const p = normalizeProduct(data.results[0]);
const assert = (c, m) => { console.log((c ? 'PASS' : 'FAIL') + '  ' + m); if (!c) process.exitCode = 1; };
assert(typeof p.category === 'string', `category is slug string (${p.category})`);
assert('originalPrice' in p, `originalPrice mapped (${p.originalPrice})`);
assert(typeof p.newArrival === 'boolean', `newArrival mapped (${p.newArrival})`);
assert(typeof p.id === 'string', `id is slug (${p.id})`);
assert(p.discount > 0, `discount present (${p.discount})`);
const list = await fetch('http://127.0.0.1:8000/api/products/?category__slug=kids').then(r => r.json());
assert(list.results.every(x => x.category.slug === 'kids'), `category filter endpoint works (${list.count})`);
