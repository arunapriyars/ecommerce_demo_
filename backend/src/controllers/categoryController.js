const db = require('../config/db');

exports.getCategories = (req, res) => {
  try {
    const categories = db.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);

    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Error fetching categories.' });
  }
};
