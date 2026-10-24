const db = require('../config/db');

exports.addReview = (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating (1-5), and review comment are required.' });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars.' });
    }

    const product = db.get('SELECT id FROM products WHERE id = ?', [Number(product_id)]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Insert review
    const resReview = db.run(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [product.id, req.user.id, numRating, comment.trim()]
    );

    // Recalculate average rating & review count for product
    const stats = db.get(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?',
      [product.id]
    );

    const roundedRating = Number((stats.avg_rating || 5.0).toFixed(1));
    const reviewCount = stats.count || 1;

    db.run(
      'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
      [roundedRating, reviewCount, product.id]
    );

    const review = db.get(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar, u.favorite_vibe as user_vibe
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [resReview.lastInsertRowid]
    );

    res.status(201).json({
      message: 'Review posted successfully! Thank you for sharing your vibe ✨',
      review,
      productRating: roundedRating,
      productReviewCount: reviewCount
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Error adding review: ' + err.message });
  }
};
