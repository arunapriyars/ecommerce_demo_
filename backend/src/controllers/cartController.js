const db = require('../config/db');

const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_FEE = 99;

function getOrCreateUserCartId(userId) {
  let cart = db.get('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (!cart) {
    const res = db.run('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return res.lastInsertRowid;
  }
  return cart.id;
}

exports.getCart = (req, res) => {
  try {
    const cartId = getOrCreateUserCartId(req.user.id);

    const items = db.query(
      `SELECT ci.id as cart_item_id, ci.quantity, ci.created_at,
              p.id as product_id, p.name, p.slug, p.price, p.original_price, p.discount, p.stock, p.image,
              v.name as vibe_name, v.icon as vibe_icon, v.color_gradient as vibe_gradient
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN vibes v ON p.vibe_id = v.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    let subtotal = 0;
    let totalItems = 0;

    for (const item of items) {
      subtotal += item.price * item.quantity;
      totalItems += item.quantity;
    }

    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
    const shippingFee = isFreeShipping ? 0 : FLAT_SHIPPING_FEE;
    const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const finalTotal = subtotal + shippingFee;

    let shippingMessage = '';
    if (subtotal === 0) {
      shippingMessage = 'Your cart is feeling lonely.';
    } else if (isFreeShipping) {
      shippingMessage = '🎉 You unlocked FREE Express Shipping!';
    } else {
      shippingMessage = `You're ₹${amountNeededForFreeShipping} away from FREE shipping 🚚`;
    }

    res.json({
      items,
      summary: {
        totalItems,
        subtotal,
        shippingFee,
        isFreeShipping,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        shippingMessage,
        finalTotal
      }
    });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Error retrieving cart.' });
  }
};

exports.addToCart = (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const qty = Math.max(1, Number(quantity));

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    const product = db.get('SELECT id, name, stock FROM products WHERE id = ?', [Number(product_id)]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: 'Sorry, this product is currently out of stock.' });
    }

    const cartId = getOrCreateUserCartId(req.user.id);
    const existingItem = db.get(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, product.id]
    );

    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} units available in stock. You already have ${existingItem.quantity} in your cart.`
        });
      }
      db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existingItem.id]);
    } else {
      if (qty > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} units available in stock.` });
      }
      db.run('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cartId, product.id, qty]);
    }

    // Update cart timestamp
    db.run("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [cartId]);

    res.json({
      message: 'Added to your vibe 🛒',
      productName: product.name
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Error adding product to cart.' });
  }
};

exports.updateQuantity = (req, res) => {
  try {
    const { id } = req.params; // cart_item_id
    const { quantity } = req.body;
    const qty = Number(quantity);

    const cartId = getOrCreateUserCartId(req.user.id);
    const item = db.get(
      `SELECT ci.*, p.stock, p.name 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.id = ? AND ci.cart_id = ?`,
      [Number(id), cartId]
    );

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (qty <= 0) {
      db.run('DELETE FROM cart_items WHERE id = ?', [item.id]);
      return res.json({ message: 'Item removed from your vibe.' });
    }

    if (qty > item.stock) {
      return res.status(400).json({ message: `Only ${item.stock} units available in stock.` });
    }

    db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [qty, item.id]);
    db.run("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [cartId]);

    res.json({ message: 'Cart updated ✨' });
  } catch (err) {
    console.error('Update cart item error:', err);
    res.status(500).json({ message: 'Error updating cart quantity.' });
  }
};

exports.removeFromCart = (req, res) => {
  try {
    const { id } = req.params;
    const cartId = getOrCreateUserCartId(req.user.id);

    db.run('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [Number(id), cartId]);
    db.run("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [cartId]);

    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: 'Error removing item from cart.' });
  }
};

exports.clearCart = (req, res) => {
  try {
    const cartId = getOrCreateUserCartId(req.user.id);
    db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    res.json({ message: 'Cart cleared.' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ message: 'Error clearing cart.' });
  }
};
