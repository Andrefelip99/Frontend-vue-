const CART_KEY = 'cart';

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cart-updated'));
  }
}

export function getCart() {
  return readCart();
}

export function addToCart(product, quantity = 1) {
  const items = readCart();
  const qty = Math.max(1, Number(quantity) || 1);
  const existing = items.find(i => i.productId === product.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      quantity: qty
    });
  }
  writeCart(items);
  return items;
}

export function updateQuantity(productId, quantity) {
  const items = readCart();
  const qty = Math.max(1, Number(quantity) || 1);
  const existing = items.find(i => i.productId === productId);
  if (existing) {
    existing.quantity = qty;
    writeCart(items);
  }
  return items;
}

export function removeFromCart(productId) {
  const items = readCart().filter(i => i.productId !== productId);
  writeCart(items);
  return items;
}

export function clearCart() {
  writeCart([]);
  return [];
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function getCartSubtotal() {
  return readCart().reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
}
