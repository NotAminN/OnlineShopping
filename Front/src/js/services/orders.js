import { fetchApi } from '../api/client.js';
import { ORDER_STATUS } from '../data/constants.js';

const ORDERS_CACHE_KEY = 'mod-style:orders';

function readOrdersCache() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_CACHE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function writeOrdersCache(orders) {
  try {
    localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(orders.slice(-50)));
  } catch (e) { /* storage unavailable */ }
}

export const orderService = {
  async createOrder({ items, totals, address, shippingMethodId, paymentMethodId }) {
    // Map items to API payload: [{product: id, quantity: n, selected_color: '...', selected_size: '...'}, ...]
    const apiItems = items.map(item => ({
        product: item.productId || item.id || item.product?.id, // Fallback for tests
        quantity: item.qty,
        selected_color: item.color || item.variant?.color || '',
        selected_size: item.size || item.variant?.size || ''
    }));

    try {
        const order = await fetchApi('/orders/', {
            method: 'POST',
            body: JSON.stringify({ items: apiItems })
        });

        const merged = {
            ...order,
            dateLabel: new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'medium',
            }).format(new Date(order.created_at)),
            deliveryEstimate: '۳ تا ۵ روز کاری',
            paymentMethodId,
            shippingMethodId,
            address
        };

        /* keep a local copy so the orders page works before/without the API */
        const cache = readOrdersCache().filter((o) => o.id !== merged.id);
        writeOrdersCache([...cache, merged]);

        return merged;
    } catch(e) {
        console.error("Order creation failed", e);
        throw e;
    }
  },

  async getOrders() {
    const cached = readOrdersCache();
    try {
        const data = await fetchApi('/orders/');
        const results = Array.isArray(data) ? data : data.results || [];
        const byId = new Map(cached.map((o) => [o.id, o]));
        results.forEach((o) => byId.set(o.id, { ...byId.get(o.id), ...o }));
        return [...byId.values()].map(order => ({
            ...order,
            dateLabel: order.dateLabel || new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'medium',
            }).format(new Date(order.created_at)),
        }));
    } catch(e) {
        return cached.map(order => ({
            ...order,
            dateLabel: order.dateLabel || new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'medium',
            }).format(new Date(order.created_at)),
        }));
    }
  },

  async getOrder(id) {
    try {
        const order = await fetchApi(`/orders/${id}/`);
        return {
            ...order,
            dateLabel: new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'medium',
            }).format(new Date(order.created_at)),
        };
    } catch(e) {
        return null;
    }
  },

  statusFa(status) {
    return ORDER_STATUS[status]?.fa ?? status;
  },
};
