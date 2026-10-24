const db = require('../config/db');

function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    tags: p.tags ? JSON.parse(p.tags) : [],
    images: p.images ? JSON.parse(p.images) : [p.image],
    why_like: p.why_like ? JSON.parse(p.why_like) : [],
    is_featured: Boolean(p.is_featured)
  };
}

exports.getWishlist = (req, res) => {
  try {
    const items = db.query(
      `SELECT w.id as wishlist_id, w.created_at as saved_at,
              p.*,
              c.name as category_name, c.slug as category_slug,
              v.name as vibe_name, v.slug as vibe_slug, v.icon as vibe_icon, v.color_gradient as vibe_gradient
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN vibes v ON p.vibe_id = v.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    ).map(formatProduct);

    res.json({
      items,
      count: items.length,
      emptyMessage: items.length === 0 ? 'Your vibe shelf is empty.' : ''
    });
  } catch (err) {
    console.error('Get wishlist error:', err);
    res.status(500).json({ message: 'Error retrieving wishlist.' });
  }
};

exports.addToWishlist = (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    const product = db.get('SELECT id, name FROM products WHERE id = ?', [Number(product_id)]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const existing = db.get(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [req.user.id, product.id]
    );

    if (existing) {
      // Toggle off / remove
      db.run('DELETE FROM wishlists WHERE id = ?', [existing.id]);
      return res.json({
        saved: false,
        message: 'Removed from your vibe shelf.'
      });
    }

    db.run('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [req.user.id, product.id]);
    res.json({
      saved: true,
      message: 'Saved to your vibe shelf ❤️'
    });
  } catch (err) {
    console.error('Toggle wishlist error:', err);
    res.status(500).json({ message: 'Error updating wishlist.' });
  }
};

exports.removeFromWishlist = (req, res) => {
  try {
    const { id } = req.params; // product_id or wishlist_id
    db.run(
      'DELETE FROM wishlists WHERE user_id = ? AND (id = ? OR product_id = ?)',
      [req.user.id, Number(id), Number(id)]
    );

    res.json({ message: 'Item removed from wishlist.' });
  } catch (err) {
    console.error('Remove from wishlist error:', err);
    res.status(500).json({ message: 'Error removing from wishlist.' });
  }
};

exports.moveToCart = (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    const product = db.get('SELECT id, name, stock FROM products WHERE id = ?', [Number(product_id)]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: 'Product is currently out of stock.' });
    }

    // Find or create cart
    let cart = db.get('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    let cartId = cart ? cart.id : null;
    if (!cartId) {
      const cRes = db.run('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
      cartId = cRes.lastInsertRowid;
    }

    // Add or increment in cart
    const existingCartItem = db.get('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, product.id]);
    if (existingCartItem) {
      db.run('UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?', [existingCartItem.id]);
    } else {
      db.run('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 1)', [cartId, product.id]);
    }

    // Remove from wishlist
    db.run('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, product.id]);

    res.json({
      message: 'Moved to your vibe cart 🛒',
      productName: product.name
    });
  } catch (err) {
    console.error('Move to cart error:', err);
    res.status(500).json({ message: 'Error moving item to cart.' });
  }
};
