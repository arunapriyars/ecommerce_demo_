const db = require('../config/db');

const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_FEE = 99;

exports.createOrder = (req, res) => {
  try {
    const {
      shipping_name,
      shipping_email,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      payment_method, // 'UPI (Google Pay/PhonePe)', 'Credit/Debit Card', 'Cash on Delivery'
      payment_details,
      discount_amount = 0
    } = req.body;

    if (!shipping_name || !shipping_email || !shipping_phone || !shipping_address || !shipping_city || !shipping_state || !shipping_postal_code || !payment_method) {
      return res.status(400).json({ message: 'All shipping details and payment method are required.' });
    }

    // Get user's cart
    const cart = db.get('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (!cart) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const cartItems = db.query(
      `SELECT ci.*, p.name, p.price, p.stock, p.image, v.name as vibe_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN vibes v ON p.vibe_id = v.id
       WHERE ci.cart_id = ?`,
      [cart.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty. Add products before checkout.' });
    }

    // Check stock for all items
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({
          message: `Product "${item.name}" has only ${item.stock} left in stock. Please adjust your cart.`
        });
      }
    }

    // Compute subtotal and shipping
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.price * item.quantity;
    }

    const discount = Math.min(Number(discount_amount) || 0, subtotal);
    const discountedSubtotal = subtotal - discount;
    const shippingFee = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
    const totalAmount = discountedSubtotal + shippingFee;

    // Generate Order Number: VB-2026-RANDOM
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `VB-2026-${randomSuffix}`;

    // Execute order creation and stock decrement in transaction
    const order = db.transaction(() => {
      // 1. Insert order
      const orderRes = db.run(
        `INSERT INTO orders (
          order_number, user_id, subtotal, discount, shipping_fee, total_amount,
          payment_method, payment_status, status,
          shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed', ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          req.user.id,
          subtotal,
          discount,
          shippingFee,
          totalAmount,
          payment_method,
          payment_method.toLowerCase().includes('cash') ? 'pending' : 'completed',
          shipping_name.trim(),
          shipping_email.trim(),
          shipping_phone.trim(),
          shipping_address.trim(),
          shipping_city.trim(),
          shipping_state.trim(),
          shipping_postal_code.trim()
        ]
      );

      const orderId = orderRes.lastInsertRowid;

      // 2. Insert order items & decrement stock
      for (const item of cartItems) {
        db.run(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, vibe_name)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.name, item.image, item.price, item.quantity, item.vibe_name || 'Vibe']
        );

        db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      // 3. Clear user's cart
      db.run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

      // 4. Save address to user profile if user has none saved
      db.run(
        `UPDATE users
         SET phone = COALESCE(phone, ?),
             address = COALESCE(address, ?),
             city = COALESCE(city, ?),
             state = COALESCE(state, ?),
             postal_code = COALESCE(postal_code, ?)
         WHERE id = ?`,
        [shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal_code, req.user.id]
      );

      return db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    });

    const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    res.status(201).json({
      message: 'Vibe secured. Order confirmed 🎉',
      orderNumber: order.order_number,
      order: {
        ...order,
        items
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Error processing order: ' + err.message });
  }
};

exports.getOrders = (req, res) => {
  try {
    const orders = db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    const ordersWithItems = orders.map(order => {
      const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return {
        ...order,
        items
      };
    });

    res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Error fetching order history.' });
  }
};

exports.getOrderById = (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (req.user.role === 'admin') {
      order = db.get('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    } else {
      order = db.get('SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?', [id, id, req.user.id]);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

    // Visual step sequence
    const statusSteps = [
      { step: 1, name: 'Order Placed', desc: 'We received your order and are preparing your vibe.' },
      { step: 2, name: 'Processing', desc: 'Items verified, carefully packed with custom stickers.' },
      { step: 3, name: 'Shipped', desc: 'Dispatched via premium express courier.' },
      { step: 4, name: 'Out for Delivery', desc: 'Your vibe package will arrive today.' },
      { step: 5, name: 'Delivered', desc: 'Package delivered. Enjoy your vibe!' }
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.name.toLowerCase() === order.status.toLowerCase());

    res.json({
      order: {
        ...order,
        items,
        tracking: {
          currentStepIndex: currentStepIndex >= 0 ? currentStepIndex : 0,
          steps: statusSteps
        }
      }
    });
  } catch (err) {
    console.error('Get order by id error:', err);
    res.status(500).json({ message: 'Error fetching order details.' });
  }
};
