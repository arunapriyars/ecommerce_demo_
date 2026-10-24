const db = require('../config/db');

exports.getDashboardStats = (req, res) => {
  try {
    const totalProducts = db.get('SELECT COUNT(*) as count FROM products')?.count || 0;
    const totalOrders = db.get('SELECT COUNT(*) as count FROM orders')?.count || 0;
    const totalUsers = db.get("SELECT COUNT(*) as count FROM users WHERE role = 'user'")?.count || 0;
    const revenueRow = db.get("SELECT SUM(total_amount) as total FROM orders WHERE status != 'Cancelled'");
    const totalRevenue = revenueRow?.total || 0;

    const lowStockProducts = db.query(
      `SELECT id, name, slug, price, stock, image
       FROM products 
       WHERE stock <= 5 
       ORDER BY stock ASC 
       LIMIT 8`
    );

    // Orders distribution by status
    const ordersByStatus = db.query(
      `SELECT status, COUNT(*) as count 
       FROM orders 
       GROUP BY status`
    );

    // Sales by Vibe
    const vibeSales = db.query(
      `SELECT oi.vibe_name, COUNT(oi.id) as item_count, SUM(oi.price * oi.quantity) as total_sales
       FROM order_items oi
       GROUP BY oi.vibe_name
       ORDER BY total_sales DESC`
    );

    // Recent 5 orders with items
    const recentOrdersRaw = db.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 6`
    );

    const recentOrders = recentOrdersRaw.map(order => {
      const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return {
        ...order,
        items
      };
    });

    res.json({
      stats: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalProducts,
        totalUsers,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      ordersByStatus,
      vibeSales,
      recentOrders
    });
  } catch (err) {
    console.error('Admin dashboard stats error:', err);
    res.status(500).json({ message: 'Error fetching dashboard analytics.' });
  }
};

exports.getAllOrders = (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT o.*, u.name as customer_name, u.email as customer_email, u.avatar as customer_avatar
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(o.order_number) LIKE ? OR 
        LOWER(o.shipping_name) LIKE ? OR 
        LOWER(o.shipping_email) LIKE ?
      )`;
      params.push(term, term, term);
    }

    query += ` ORDER BY o.created_at DESC`;

    const orders = db.query(query, params).map(order => {
      const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return {
        ...order,
        items
      };
    });

    res.json({ orders });
  } catch (err) {
    console.error('Admin get all orders error:', err);
    res.status(500).json({ message: 'Error retrieving orders.' });
  }
};

exports.updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Valid options are: ${validStatuses.join(', ')}` });
    }

    const order = db.get('SELECT id, order_number FROM orders WHERE id = ?', [Number(id)]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    db.run(
      "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, order.id]
    );

    const updated = db.get('SELECT * FROM orders WHERE id = ?', [order.id]);
    res.json({
      message: `Order #${order.order_number} status updated to "${status}".`,
      order: updated
    });
  } catch (err) {
    console.error('Admin update order status error:', err);
    res.status(500).json({ message: 'Error updating order status.' });
  }
};

exports.getAllUsers = (req, res) => {
  try {
    const users = db.query(
      `SELECT u.id, u.name, u.email, u.role, u.favorite_vibe, u.avatar, u.city, u.state, u.created_at,
              COUNT(o.id) as order_count,
              COALESCE(SUM(o.total_amount), 0) as total_spent
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    res.json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ message: 'Error retrieving users.' });
  }
};
