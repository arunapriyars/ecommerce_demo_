// Comprehensive End-to-End Test for VibeCart Full-Stack Application
const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`[${res.status}] ${data.message || res.statusText}`);
  }
  return data;
}

async function runTests() {
  console.log('=====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE VIBECART END-TO-END TESTS 🚀');
  console.log('=====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    console.log('\n--- Test 1: API Server Health ---');
    const health = await request('/health');
    assert(health.status === 'online', 'Health endpoint reports online status');
    assert(health.app === 'VibeCart API', 'Tagline and App name are verified');
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // 2. Vibes and Quiz Recommendation
  try {
    console.log('\n--- Test 2: Vibe Quiz Recommendation Engine ---');
    const vibesData = await request('/vibes');
    assert(vibesData.vibes.length === 6, 'All 6 trending vibes exist in database');

    const quizResult = await request('/vibes/recommend', {
      method: 'POST',
      body: JSON.stringify({
        activity: 'studying',
        aesthetic: 'minimal',
        energy: 'balanced',
        priority: 'productivity'
      })
    });
    assert(quizResult.dominantVibe.slug === 'study-mode', 'Quiz correctly decodes dominant vibe as Study Mode 🧠');
    assert(quizResult.products.length > 0, `Quiz returns ${quizResult.products.length} recommended products`);
  } catch (err) {
    assert(false, `Vibe Quiz test failed: ${err.message}`);
  }

  // 3. Products Catalog & Search Filtering
  try {
    console.log('\n--- Test 3: Catalog Search and Multi-Filtering ---');
    const allProducts = await request('/products?limit=100');
    assert(allProducts.products.length >= 30, `Database populated with ${allProducts.products.length} products`);

    const searchRes = await request('/products?search=lamp');
    assert(searchRes.products.length >= 1, `Search by "lamp" found ${searchRes.products.length} item(s)`);

    const filteredVibe = await request('/products?vibe=gamer-mode');
    assert(filteredVibe.products.length >= 5, `Filter by vibe "gamer-mode" found ${filteredVibe.products.length} items`);

    const filteredPrice = await request('/products?maxPrice=1000');
    assert(filteredPrice.products.every(p => p.price <= 1000), 'Price filter correctly limits max price');
  } catch (err) {
    assert(false, `Catalog test failed: ${err.message}`);
  }

  // 4. Customer Login
  let customerToken = '';
  let customerUser = null;
  try {
    console.log('\n--- Test 4: Customer Authentication ---');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@vibecart.com',
        password: 'password123'
      })
    });
    assert(Boolean(loginRes.token), 'Customer received JWT authentication token');
    assert(loginRes.user.email === 'user@vibecart.com', 'Authenticated user identity verified');
    customerToken = loginRes.token;
    customerUser = loginRes.user;

    const profileRes = await request('/auth/profile', {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert(profileRes.user.name === 'Priya Patel', 'Profile successfully fetched via JWT');
  } catch (err) {
    assert(false, `Customer login failed: ${err.message}`);
  }

  // 5. Cart Operations
  try {
    console.log('\n--- Test 5: Cart Operations & Dynamic Totals ---');
    const authHeaders = { Authorization: `Bearer ${customerToken}` };

    // Get product to add
    const product = (await request('/products?limit=1')).products[0];
    const addRes = await request('/cart', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ product_id: product.id, quantity: 2 })
    });
    assert(addRes.message === 'Added to your vibe 🛒', 'Product added to cart with micro-interaction message');

    const cart = await request('/cart', { headers: authHeaders });
    assert(cart.items.length > 0, `Cart contains ${cart.items.length} items`);
    assert(cart.summary.subtotal > 0, `Subtotal calculated as ₹${cart.summary.subtotal}`);
    assert(typeof cart.summary.shippingMessage === 'string', `Free shipping message: "${cart.summary.shippingMessage}"`);
  } catch (err) {
    assert(false, `Cart test failed: ${err.message}`);
  }

  // 6. Wishlist Operations
  try {
    console.log('\n--- Test 6: Wishlist Operations ---');
    const authHeaders = { Authorization: `Bearer ${customerToken}` };
    const product = (await request('/products?limit=5')).products[4];

    const toggleRes = await request('/wishlist', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ product_id: product.id })
    });
    assert(typeof toggleRes.saved === 'boolean', `Wishlist toggle response: saved=${toggleRes.saved}`);

    const wishlist = await request('/wishlist', { headers: authHeaders });
    assert(Array.isArray(wishlist.items), `Wishlist returned ${wishlist.items.length} saved products`);
  } catch (err) {
    assert(false, `Wishlist test failed: ${err.message}`);
  }

  // 7. Checkout and Order Placement
  let createdOrderId = null;
  try {
    console.log('\n--- Test 7: Checkout & Simulated Order Placement ---');
    const authHeaders = { Authorization: `Bearer ${customerToken}` };

    const orderRes = await request('/orders', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        shipping_name: 'Priya Patel',
        shipping_email: 'user@vibecart.com',
        shipping_phone: '+91 91234 56789',
        shipping_address: '404 Innovation Hub, Tech Park',
        shipping_city: 'Bengaluru',
        shipping_state: 'Karnataka',
        shipping_postal_code: '560103',
        payment_method: 'UPI (Google Pay)',
        discount_amount: 100
      })
    });

    assert(orderRes.message === 'Vibe secured. Order confirmed 🎉', 'Order confirmed message verified');
    assert(Boolean(orderRes.orderNumber), `Generated Order Number: ${orderRes.orderNumber}`);
    createdOrderId = orderRes.order.id;

    // Check cart is cleared after checkout
    const emptyCart = await request('/cart', { headers: authHeaders });
    assert(emptyCart.items.length === 0, 'Cart successfully cleared after order placement');

    // Check Order Tracking
    const trackingRes = await request(`/orders/${createdOrderId}`, { headers: authHeaders });
    assert(trackingRes.order.tracking.steps.length === 5, 'Order has 5-step tracking journey');
    assert(trackingRes.order.tracking.steps[0].name === 'Order Placed', 'Step 1 is Order Placed');
  } catch (err) {
    assert(false, `Checkout test failed: ${err.message}`);
  }

  // 8. Admin Login & Operations
  let adminToken = '';
  try {
    console.log('\n--- Test 8: Admin Authentication & Dashboard Analytics ---');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@vibecart.com',
        password: 'admin123'
      })
    });
    assert(adminLogin.user.role === 'admin', 'Admin user verified with admin role');
    adminToken = adminLogin.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const dashboard = await request('/admin/dashboard', { headers: adminHeaders });
    assert(dashboard.stats.totalProducts > 0, `Admin stats: ${dashboard.stats.totalProducts} products`);
    assert(dashboard.stats.totalRevenue > 0, `Admin stats: ₹${dashboard.stats.totalRevenue} total revenue`);
    assert(dashboard.stats.totalOrders > 0, `Admin stats: ${dashboard.stats.totalOrders} total orders`);
    assert(Array.isArray(dashboard.vibeSales), 'Vibe sales chart distribution data verified');
  } catch (err) {
    assert(false, `Admin dashboard test failed: ${err.message}`);
  }

  // 9. Admin Product CRUD & Order Status Update
  try {
    console.log('\n--- Test 9: Admin CRUD Operations & Status Management ---');
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // Create a product
    const createRes = await request('/products', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Automated Test Mood Lamp',
        description: 'Test product created by automated validation runner.',
        price: 999,
        original_price: 1499,
        stock: 15,
        category_id: 1,
        vibe_id: 2,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        tags: ['study', 'minimal', 'test'],
        why_like: ['Test point 1', 'Test point 2']
      })
    });
    const createdProductId = createRes.product.id;
    assert(Boolean(createdProductId), `Product created with ID #${createdProductId}`);

    // Update the product
    const updateRes = await request(`/products/${createdProductId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ price: 849, stock: 25 })
    });
    assert(updateRes.product.price === 849, 'Product price updated to ₹849');
    assert(updateRes.product.stock === 25, 'Product stock updated to 25 units');

    // Update order status
    if (createdOrderId) {
      const statusRes = await request(`/admin/orders/${createdOrderId}/status`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'Processing' })
      });
      assert(statusRes.order.status === 'Processing', 'Order status updated to "Processing" in database');
    }

    // Delete the test product
    const delRes = await request(`/products/${createdProductId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assert(delRes.message.includes('deleted successfully'), 'Product deleted cleanly from database');
  } catch (err) {
    assert(false, `Admin CRUD test failed: ${err.message}`);
  }

  console.log('\n=====================================================');
  console.log(`📊 FINAL TEST REPORT: ${passed} PASSED | ${failed} FAILED`);
  console.log('=====================================================');

  if (failed === 0) {
    console.log('🎉 ALL SYSTEM CAPABILITIES FUNCTIONING FLAWLESSLY! 🎉');
  } else {
    process.exit(1);
  }
}

runTests();
