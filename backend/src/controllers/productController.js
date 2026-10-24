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

exports.getProducts = (req, res) => {
  try {
    const {
      search,
      category,
      vibe,
      minPrice,
      maxPrice,
      minRating,
      sort,
      featured,
      limit = 50,
      offset = 0
    } = req.query;

    let query = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             v.name as vibe_name, v.slug as vibe_slug, v.icon as vibe_icon, v.color_gradient as vibe_gradient
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vibes v ON p.vibe_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(p.name) LIKE ? OR 
        LOWER(p.description) LIKE ? OR 
        LOWER(p.tags) LIKE ? OR 
        LOWER(c.name) LIKE ? OR 
        LOWER(v.name) LIKE ?
      )`;
      params.push(term, term, term, term, term);
    }

    if (category) {
      if (isNaN(Number(category))) {
        query += ` AND c.slug = ?`;
        params.push(category);
      } else {
        query += ` AND p.category_id = ?`;
        params.push(Number(category));
      }
    }

    if (vibe) {
      if (isNaN(Number(vibe))) {
        query += ` AND v.slug = ?`;
        params.push(vibe);
      } else {
        query += ` AND p.vibe_id = ?`;
        params.push(Number(vibe));
      }
    }

    if (minPrice !== undefined && minPrice !== '') {
      query += ` AND p.price >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      query += ` AND p.price <= ?`;
      params.push(Number(maxPrice));
    }

    if (minRating !== undefined && minRating !== '') {
      query += ` AND p.rating >= ?`;
      params.push(Number(minRating));
    }

    if (featured === 'true' || featured === '1') {
      query += ` AND p.is_featured = 1`;
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price-desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'rating':
        query += ` ORDER BY p.rating DESC, p.review_count DESC`;
        break;
      case 'newest':
        query += ` ORDER BY p.created_at DESC`;
        break;
      case 'featured':
      default:
        query += ` ORDER BY p.is_featured DESC, p.rating DESC, p.id ASC`;
        break;
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const products = db.query(query, params).map(formatProduct);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vibes v ON p.vibe_id = v.id
      WHERE 1=1
    `;
    const countParams = params.slice(0, params.length - 2); // omit limit and offset
    // Re-construct filter string for count
    if (search && search.trim() !== '') {
      countQuery += ` AND (
        LOWER(p.name) LIKE ? OR 
        LOWER(p.description) LIKE ? OR 
        LOWER(p.tags) LIKE ? OR 
        LOWER(c.name) LIKE ? OR 
        LOWER(v.name) LIKE ?
      )`;
    }
    if (category) {
      countQuery += isNaN(Number(category)) ? ` AND c.slug = ?` : ` AND p.category_id = ?`;
    }
    if (vibe) {
      countQuery += isNaN(Number(vibe)) ? ` AND v.slug = ?` : ` AND p.vibe_id = ?`;
    }
    if (minPrice !== undefined && minPrice !== '') countQuery += ` AND p.price >= ?`;
    if (maxPrice !== undefined && maxPrice !== '') countQuery += ` AND p.price <= ?`;
    if (minRating !== undefined && minRating !== '') countQuery += ` AND p.rating >= ?`;
    if (featured === 'true' || featured === '1') countQuery += ` AND p.is_featured = 1`;

    const totalCount = db.get(countQuery, countParams)?.total || products.length;

    res.json({
      products,
      total: totalCount,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Error retrieving products.' });
  }
};

exports.getProductById = (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (isNaN(Number(id))) {
      // Slug lookup
      product = db.get(
        `SELECT p.*, 
                c.name as category_name, c.slug as category_slug,
                v.name as vibe_name, v.slug as vibe_slug, v.icon as vibe_icon, v.color_gradient as vibe_gradient
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN vibes v ON p.vibe_id = v.id
         WHERE p.slug = ?`,
        [id]
      );
    } else {
      product = db.get(
        `SELECT p.*, 
                c.name as category_name, c.slug as category_slug,
                v.name as vibe_name, v.slug as vibe_slug, v.icon as vibe_icon, v.color_gradient as vibe_gradient
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN vibes v ON p.vibe_id = v.id
         WHERE p.id = ?`,
        [Number(id)]
      );
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Fetch product reviews
    const reviews = db.query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar, u.favorite_vibe as user_vibe
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [product.id]
    );

    res.json({
      product: formatProduct(product),
      reviews
    });
  } catch (err) {
    console.error('Get product by id error:', err);
    res.status(500).json({ message: 'Error fetching product details.' });
  }
};

exports.getSimilarProducts = (req, res) => {
  try {
    const { id } = req.params;
    const current = db.get('SELECT id, category_id, vibe_id FROM products WHERE id = ? OR slug = ?', [id, id]);

    if (!current) {
      return res.json({ products: [] });
    }

    const query = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             v.name as vibe_name, v.slug as vibe_slug, v.icon as vibe_icon, v.color_gradient as vibe_gradient
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN vibes v ON p.vibe_id = v.id
      WHERE p.id != ? AND (p.vibe_id = ? OR p.category_id = ?)
      ORDER BY p.rating DESC
      LIMIT 4
    `;

    const products = db.query(query, [current.id, current.vibe_id, current.category_id]).map(formatProduct);
    res.json({ products });
  } catch (err) {
    console.error('Get similar products error:', err);
    res.status(500).json({ message: 'Error fetching similar products.' });
  }
};

exports.createProduct = (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      stock = 10,
      category_id,
      vibe_id,
      tags = [],
      image,
      why_like = [],
      is_featured = 0
    } = req.body;

    if (!name || !description || !price || !image) {
      return res.status(400).json({ message: 'Name, description, price, and image are required.' });
    }

    // Auto-generate slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const discount = original_price && original_price > price
      ? Math.round(((original_price - price) / original_price) * 100)
      : 0;

    const result = db.run(
      `INSERT INTO products (
        name, slug, description, price, original_price, discount, stock,
        category_id, vibe_id, tags, image, images, rating, review_count, why_like, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        uniqueSlug,
        description.trim(),
        Number(price),
        original_price ? Number(original_price) : Number(price),
        discount,
        Number(stock),
        category_id ? Number(category_id) : null,
        vibe_id ? Number(vibe_id) : null,
        JSON.stringify(Array.isArray(tags) ? tags : [tags]),
        image.trim(),
        JSON.stringify([image.trim()]),
        5.0,
        1,
        JSON.stringify(Array.isArray(why_like) ? why_like : [why_like]),
        is_featured ? 1 : 0
      ]
    );

    const newProduct = db.get('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({
      message: 'Product created successfully! 🚀',
      product: formatProduct(newProduct)
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Error creating product: ' + err.message });
  }
};

exports.updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      original_price,
      stock,
      category_id,
      vibe_id,
      tags,
      image,
      why_like,
      is_featured
    } = req.body;

    const existing = db.get('SELECT id FROM products WHERE id = ?', [Number(id)]);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const discount = (original_price && price && original_price > price)
      ? Math.round(((original_price - price) / original_price) * 100)
      : 0;

    db.run(
      `UPDATE products
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           original_price = COALESCE(?, original_price),
           discount = ?,
           stock = COALESCE(?, stock),
           category_id = COALESCE(?, category_id),
           vibe_id = COALESCE(?, vibe_id),
           tags = COALESCE(?, tags),
           image = COALESCE(?, image),
           why_like = COALESCE(?, why_like),
           is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [
        name ?? null,
        description ?? null,
        price !== undefined ? Number(price) : null,
        original_price !== undefined ? Number(original_price) : null,
        discount ?? 0,
        stock !== undefined ? Number(stock) : null,
        category_id !== undefined ? Number(category_id) : null,
        vibe_id !== undefined ? Number(vibe_id) : null,
        tags ? JSON.stringify(tags) : null,
        image ?? null,
        why_like ? JSON.stringify(why_like) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        Number(id)
      ]
    );

    const updated = db.get('SELECT * FROM products WHERE id = ?', [Number(id)]);
    res.json({
      message: 'Product updated successfully ✨',
      product: formatProduct(updated)
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Error updating product: ' + err.message });
  }
};

exports.deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.get('SELECT id, name FROM products WHERE id = ?', [Number(id)]);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    db.run('DELETE FROM products WHERE id = ?', [Number(id)]);
    res.json({ message: `Product "${existing.name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Error deleting product.' });
  }
};
