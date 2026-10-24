const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { initSchema } = require('./schema');

async function seed() {
  console.log('--- Initializing database schema ---');
  initSchema();

  console.log('--- Clearing old data ---');
  // Disable FK temporarily for clean wipe
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM order_items;');
  db.exec('DELETE FROM orders;');
  db.exec('DELETE FROM cart_items;');
  db.exec('DELETE FROM carts;');
  db.exec('DELETE FROM wishlists;');
  db.exec('DELETE FROM reviews;');
  db.exec('DELETE FROM products;');
  db.exec('DELETE FROM categories;');
  db.exec('DELETE FROM vibes;');
  db.exec('DELETE FROM users;');
  db.exec('PRAGMA foreign_keys = ON;');

  console.log('--- Seeding Categories ---');
  const categories = [
    { name: 'Desk & Tech', slug: 'desk-tech', description: 'Productivity setups, audio gear, and sleek desk aesthetics.', icon: 'Laptop', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },
    { name: 'Apparel & Gear', slug: 'apparel-gear', description: 'Streetwear, training apparel, and statement daily wear.', icon: 'Shirt', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Home & Living', slug: 'home-living', description: 'Cozy blankets, calming scents, ambient lighting, and aesthetic drinkware.', icon: 'Coffee', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Creative & Art', slug: 'creative-art', description: 'Sketchbooks, premium markers, digital tablets, and studio accessories.', icon: 'Palette', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Accessories & Daily Carry', slug: 'accessories', description: 'Watches, shades, bags, and everyday carry essentials.', icon: 'Watch', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' }
  ];

  for (const cat of categories) {
    db.run(
      'INSERT INTO categories (name, slug, description, icon, image) VALUES (?, ?, ?, ?, ?)',
      [cat.name, cat.slug, cat.description, cat.icon, cat.image]
    );
  }

  console.log('--- Seeding Vibes ---');
  const vibes = [
    {
      name: 'Main Character',
      slug: 'main-character',
      icon: '😎',
      tagline: 'Stand out. Own the room.',
      description: 'Bold aesthetic pieces that turn heads and make an unforgettable statement.',
      color_gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      accent_color: '#f59e0b'
    },
    {
      name: 'Study Mode',
      slug: 'study-mode',
      icon: '🧠',
      tagline: 'Deep focus. Zero distractions.',
      description: 'Minimalist, functional essentials engineered for laser productivity.',
      color_gradient: 'from-indigo-600 via-violet-600 to-blue-500',
      accent_color: '#6366f1'
    },
    {
      name: 'Gym Beast',
      slug: 'gym-beast',
      icon: '🏋️',
      tagline: 'Crush limits. No excuses.',
      description: 'High-performance fitness gear built for heavy lifts, endurance, and grit.',
      color_gradient: 'from-red-600 via-rose-600 to-orange-600',
      accent_color: '#ef4444'
    },
    {
      name: 'Gamer Mode',
      slug: 'gamer-mode',
      icon: '🎮',
      tagline: 'High FPS. High intensity.',
      description: 'RGB glow, tactile switches, and ergonomic gear built for victory.',
      color_gradient: 'from-fuchsia-600 via-purple-600 to-cyan-500',
      accent_color: '#d946ef'
    },
    {
      name: 'Chill Mode',
      slug: 'chill-mode',
      icon: '🌿',
      tagline: 'Breathe in. Unwind completely.',
      description: 'Comforting, soothing, warm aesthetic additions for peaceful downtime.',
      color_gradient: 'from-emerald-500 via-teal-500 to-green-600',
      accent_color: '#10b981'
    },
    {
      name: 'Creative Mode',
      slug: 'creative-mode',
      icon: '🎨',
      tagline: 'Express yourself. Pure artistry.',
      description: 'Inspiring tools and journals to turn imagination into reality.',
      color_gradient: 'from-orange-500 via-pink-500 to-rose-500',
      accent_color: '#f97316'
    }
  ];

  for (const v of vibes) {
    db.run(
      'INSERT INTO vibes (name, slug, icon, tagline, description, color_gradient, accent_color) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [v.name, v.slug, v.icon, v.tagline, v.description, v.color_gradient, v.accent_color]
    );
  }

  // Retrieve IDs for mapping
  const categoryRows = db.query('SELECT id, slug FROM categories');
  const catMap = Object.fromEntries(categoryRows.map(c => [c.slug, c.id]));

  const vibeRows = db.query('SELECT id, slug FROM vibes');
  const vibeMap = Object.fromEntries(vibeRows.map(v => [v.slug, v.id]));

  console.log('--- Seeding Products (32 curated products) ---');
  const products = [
    // --- STUDY MODE ---
    {
      name: 'Minimalist Matte Desk Lamp',
      slug: 'minimalist-matte-desk-lamp',
      description: 'Ultra-slim architectural LED desk lamp with 5 color temperatures, step-less touch dimming, and zero blue-light flicker for late-night study sessions.',
      price: 1899,
      original_price: 2499,
      discount: 24,
      stock: 18,
      category_slug: 'desk-tech',
      vibe_slug: 'study-mode',
      tags: ['study', 'minimal', 'productivity', 'tech', 'desk'],
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 64,
      why_like: ['Great for Study Mode', 'Zero blue-light flicker', 'Touch step-less dimming', 'Aerospace aluminum build'],
      is_featured: 1
    },
    {
      name: 'Nordic Mechanical Pencil & Brass Pen Set',
      slug: 'nordic-mechanical-pencil-brass-pen-set',
      description: 'Weighted precision writing instruments crafted from solid brass with matte black knurled grip. Designed for frictionless note-taking and architectural drafting.',
      price: 899,
      original_price: 1299,
      discount: 30,
      stock: 25,
      category_slug: 'creative-art',
      vibe_slug: 'study-mode',
      tags: ['study', 'minimal', 'productivity', 'writing'],
      image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 42,
      why_like: ['Precision balanced weight', 'Solid brass durability', 'Smooth refillable ink', 'Perfect for deep work'],
      is_featured: 0
    },
    {
      name: 'Daily Flow Productivity Planner (Undated)',
      slug: 'daily-flow-productivity-planner',
      description: 'Hardcover vegan leather journal with time-blocking layouts, weekly reflection spreads, and 120gsm bleed-proof bamboo paper.',
      price: 649,
      original_price: 999,
      discount: 35,
      stock: 40,
      category_slug: 'creative-art',
      vibe_slug: 'study-mode',
      tags: ['study', 'productivity', 'minimal', 'planning'],
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 53,
      why_like: ['120gsm ink-proof bamboo paper', 'Undated 6-month layout', 'Pomodoro & time-blocking grids', 'Elastic pen loop'],
      is_featured: 1
    },
    {
      name: 'SilencePro Active Noise-Cancelling Headphones',
      slug: 'silencepro-anc-headphones',
      description: 'Over-ear hybrid active noise cancelling headphones with 45-hour battery life, plush memory foam earcups, and studio-grade transparent audio.',
      price: 3499,
      original_price: 4999,
      discount: 30,
      stock: 12,
      category_slug: 'desk-tech',
      vibe_slug: 'study-mode',
      tags: ['study', 'tech', 'audio', 'productivity', 'focus'],
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 118,
      why_like: ['40dB hybrid noise reduction', '45hr marathon battery', 'Dual device multi-point sync', 'Ultra plush memory foam'],
      is_featured: 1
    },
    {
      name: 'Ergonomic Foldable Aluminum Laptop Riser',
      slug: 'ergonomic-laptop-riser',
      description: 'Portable aircraft-grade aluminum stand with 6 adjustable angles and silicone anti-slip grips. Keeps your spine aligned and laptop cool.',
      price: 1199,
      original_price: 1699,
      discount: 29,
      stock: 30,
      category_slug: 'desk-tech',
      vibe_slug: 'study-mode',
      tags: ['study', 'tech', 'ergonomics', 'minimal'],
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 77,
      why_like: ['Fixes posture & neck strain', '6 height adjustments', 'Folds flat for backpack storage', 'High thermal dissipation'],
      is_featured: 0
    },

    // --- GYM BEAST ---
    {
      name: 'Apex Heavy-Duty Loop Resistance Bands (Set of 5)',
      slug: 'apex-heavy-duty-resistance-bands',
      description: '100% natural Malaysian latex bands offering 10 to 150 lbs of stackable resistance. Includes snap-proof door anchor, ankle straps, and travel pouch.',
      price: 899,
      original_price: 1499,
      discount: 40,
      stock: 22,
      category_slug: 'apparel-gear',
      vibe_slug: 'gym-beast',
      tags: ['gym', 'fitness', 'sporty', 'performance', 'beast'],
      image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 85,
      why_like: ['Up to 150 lbs resistance', 'Snap-proof dual-layer latex', 'Door anchor included', 'Lifetime warranty'],
      is_featured: 1
    },
    {
      name: 'Matte Stealth Vacuum Gym Bottle 1000ml',
      slug: 'matte-stealth-vacuum-gym-bottle',
      description: 'Triple-insulated stainless steel water bottle that keeps electrolytes ice-cold for 24 hours. Features leak-proof chug cap and powder-coated textured grip.',
      price: 799,
      original_price: 1199,
      discount: 33,
      stock: 35,
      category_slug: 'everyday-essentials',
      vibe_slug: 'gym-beast',
      tags: ['gym', 'fitness', 'hydration', 'minimal', 'sporty'],
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 142,
      why_like: ['24hr ice cold retention', 'BPA-free 18/8 steel', 'Leak-proof magnetic cap', 'Sweat-free powder coat'],
      is_featured: 0
    },
    {
      name: 'IronGrip Leather Weightlifting Straps & Gloves',
      slug: 'irongrip-weightlifting-gloves',
      description: 'Genuine cowhide padded lifting straps with reinforced silicone honeycomb palm for maximum grip on heavy deadlifts and pull-ups.',
      price: 949,
      original_price: 1399,
      discount: 32,
      stock: 19,
      category_slug: 'apparel-gear',
      vibe_slug: 'gym-beast',
      tags: ['gym', 'fitness', 'gear', 'beast', 'performance'],
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 61,
      why_like: ['Reinforced silicone honeycomb grip', 'Built-in wrist support wraps', 'Prevents hand blisters & calluses', 'Heavy duty double stitching'],
      is_featured: 0
    },
    {
      name: 'Titan Tactical Waterproof Gym Duffel Bag 45L',
      slug: 'titan-tactical-gym-duffel',
      description: 'Military-grade 900D water-repellent polyester duffel bag featuring an isolated ventilated shoe compartment, wet pocket, and MOLLE webbing.',
      price: 2199,
      original_price: 2999,
      discount: 26,
      stock: 14,
      category_slug: 'apparel-gear',
      vibe_slug: 'gym-beast',
      tags: ['gym', 'bag', 'travel', 'sporty', 'beast'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 94,
      why_like: ['Ventilated sneaker tunnel', 'Waterproof wet pouch', '900D tear-proof ballistic nylon', 'Padded ergonomic shoulder strap'],
      is_featured: 1
    },
    {
      name: 'DeepTissue High-Density Foam Roller 45cm',
      slug: 'deeptissue-high-density-foam-roller',
      description: 'Trigger-point foam roller engineered to release lactic acid, soothe stiff IT bands, and speed up post-workout muscle recovery.',
      price: 749,
      original_price: 1099,
      discount: 31,
      stock: 28,
      category_slug: 'apparel-gear',
      vibe_slug: 'gym-beast',
      tags: ['gym', 'recovery', 'fitness', 'health'],
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      rating: 4.6,
      review_count: 48,
      why_like: ['Targeted trigger-point grid', 'High-density EVA foam core', 'Relieves muscle knots & soreness', 'Lightweight & portable'],
      is_featured: 0
    },

    // --- GAMER MODE ---
    {
      name: 'CyberGlow Prism RGB Extended Desk Mat (90x40cm)',
      slug: 'cyberglow-rgb-desk-mat',
      description: 'Micro-textured speed cloth surface with 14 dynamic RGB lighting modes, water-resistant coating, and anti-slip rubber base.',
      price: 1299,
      original_price: 1899,
      discount: 31,
      stock: 20,
      category_slug: 'desk-tech',
      vibe_slug: 'gamer-mode',
      tags: ['gaming', 'rgb', 'tech', 'fun', 'desk'],
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 109,
      why_like: ['14 vibrant RGB lighting presets', 'Micro-woven speed cloth', 'Waterproof nano coating', 'Extra large 900x400mm surface'],
      is_featured: 1
    },
    {
      name: 'Vortex Phantom Ultralight Honeycomb Gaming Mouse',
      slug: 'vortex-phantom-ultralight-mouse',
      description: '59g featherweight ergonomic mouse with PMW3389 16,000 DPI optical sensor, pure PTFE glides, and paracord ultra-flexible cable.',
      price: 2499,
      original_price: 3499,
      discount: 28,
      stock: 16,
      category_slug: 'desk-tech',
      vibe_slug: 'gamer-mode',
      tags: ['gaming', 'tech', 'performance', 'fun', 'speed'],
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 82,
      why_like: ['Ultralight 59 grams weight', '16,000 DPI optical precision', 'Pure virgin PTFE feet', 'Zero-drag paracord cord'],
      is_featured: 1
    },
    {
      name: 'AeroDual Acrylic Controller & Headphone Tower',
      slug: 'aerodual-controller-headphone-stand',
      description: 'Crystal-clear heavy acrylic display tower that holds two controllers and one gaming headset simultaneously with cable organizers.',
      price: 899,
      original_price: 1299,
      discount: 30,
      stock: 25,
      category_slug: 'desk-tech',
      vibe_slug: 'gamer-mode',
      tags: ['gaming', 'tech', 'organization', 'minimal'],
      image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 39,
      why_like: ['Universal fit for Xbox/PS5/Switch', 'Heavy weighted anti-tip base', 'Integrated headphone cradle', 'Cleans up desk clutter'],
      is_featured: 0
    },
    {
      name: 'KeyCraft 75% Hot-Swappable Mechanical Keyboard',
      slug: 'keycraft-75-mechanical-keyboard',
      description: 'Gasket-mounted custom keyboard with factory-lubed linear switches, south-facing RGB, sound dampening silicone foams, and PBT dye-sub keycaps.',
      price: 4299,
      original_price: 5999,
      discount: 28,
      stock: 8,
      category_slug: 'desk-tech',
      vibe_slug: 'gamer-mode',
      tags: ['gaming', 'tech', 'minimal', 'productivity', 'keyboard'],
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      review_count: 124,
      why_like: ['Creamy acoustic sound profile', 'Hot-swappable 3/5 pin PCB', 'Triple connectivity (BT/2.4G/Wired)', 'Thick dye-sub PBT keycaps'],
      is_featured: 1
    },
    {
      name: 'Cyberpunk Neon LED Lightbar (Smart App Sync)',
      slug: 'cyberpunk-neon-smart-lightbar',
      description: 'Music-reactive ambient LED light bar with 16 million colors, scene modes, and rhythm pickup for immersive monitor backlighting.',
      price: 1599,
      original_price: 2299,
      discount: 30,
      stock: 18,
      category_slug: 'desk-tech',
      vibe_slug: 'gamer-mode',
      tags: ['gaming', 'rgb', 'ambient', 'fun'],
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 67,
      why_like: ['Syncs with gaming audio', '16M vibrant colors', 'Wi-Fi & Bluetooth app control', 'Vertical and horizontal mount'],
      is_featured: 0
    },

    // --- CHILL MODE ---
    {
      name: 'Handcrafted Sandstone Ceramic Coffee Mug (380ml)',
      slug: 'handcrafted-sandstone-ceramic-mug',
      description: 'Artisanal speckled stoneware mug with an ergonomic thumb rest and warm earthy matte glaze. Each piece is uniquely wheel-thrown.',
      price: 499,
      original_price: 799,
      discount: 37,
      stock: 35,
      category_slug: 'home-living',
      vibe_slug: 'chill-mode',
      tags: ['chill', 'cozy', 'coffee', 'minimal', 'relaxing'],
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 110,
      why_like: ['Wheel-thrown natural stoneware', 'Comfortable thumb-rest handle', 'Microwave & dishwasher safe', 'Keeps warmth longer'],
      is_featured: 1
    },
    {
      name: 'Sandalwood & Warm Amber Soy Wax Candle (220g)',
      slug: 'sandalwood-amber-soy-candle',
      description: '100% natural soy candle with a crackling wooden wick, housed in an amber glass jar. Offers 50 hours of calming woody aromatic ambiance.',
      price: 699,
      original_price: 999,
      discount: 30,
      stock: 24,
      category_slug: 'home-living',
      vibe_slug: 'chill-mode',
      tags: ['chill', 'cozy', 'relaxing', 'scent', 'home'],
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 73,
      why_like: ['Soothing crackling wood wick', '50-hour clean burn time', 'Zero synthetic paraffin', 'Re-usable vintage amber jar'],
      is_featured: 1
    },
    {
      name: 'Zen Oasis Self-Watering Ceramic Succulent Planter',
      slug: 'zen-oasis-succulent-planter',
      description: 'Minimalist two-piece ceramic planter with cotton wick self-watering reservoir. Keeps indoor plants thriving effortlessly.',
      price: 549,
      original_price: 799,
      discount: 31,
      stock: 30,
      category_slug: 'home-living',
      vibe_slug: 'chill-mode',
      tags: ['chill', 'plants', 'minimal', 'decor', 'relaxing'],
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 45,
      why_like: ['Wick self-watering mechanism', 'Matte white architectural finish', 'Ideal for succulents & pothos', 'Prevents root rot'],
      is_featured: 0
    },
    {
      name: 'CloudSoft Chunky Knit Sherpa Throw Blanket (150x200cm)',
      slug: 'cloudsoft-chunky-knit-throw-blanket',
      description: 'Reversible plush throw blanket with ribbed cable knit on one side and ultra-warm fluffy faux fleece sherpa on the other.',
      price: 1999,
      original_price: 2899,
      discount: 31,
      stock: 15,
      category_slug: 'home-living',
      vibe_slug: 'chill-mode',
      tags: ['chill', 'cozy', 'comfort', 'relaxing'],
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 98,
      why_like: ['Dual sided cloud-like softness', 'Machine washable & anti-shed', 'Warm without being heavy', 'Elevates couch aesthetic'],
      is_featured: 1
    },
    {
      name: 'AromaMist Ultrasonic Diffuser & Himalayan Salt Lamp',
      slug: 'aromamist-ultrasonic-salt-diffuser',
      description: 'Combines genuine raw pink Himalayan salt crystals with a whisper-quiet ultrasonic essential oil aroma mister and warm candle-glow LED.',
      price: 1799,
      original_price: 2499,
      discount: 28,
      stock: 17,
      category_slug: 'home-living',
      vibe_slug: 'chill-mode',
      tags: ['chill', 'relaxing', 'wellness', 'cozy', 'home'],
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 62,
      why_like: ['Authentic Himalayan rock salt', 'Whisper-quiet <20dB operation', 'Auto shut-off when dry', 'Mood-enhancing warm glow'],
      is_featured: 0
    },

    // --- CREATIVE MODE ---
    {
      name: 'Artisan Hardcover Mixed Media Sketchbook (A4, 200gsm)',
      slug: 'artisan-mixed-media-sketchbook',
      description: 'Cold-pressed 200gsm acid-free textured paper suitable for gouache, watercolors, ink pens, and graphite. Lies completely flat at 180 degrees.',
      price: 749,
      original_price: 1099,
      discount: 31,
      stock: 22,
      category_slug: 'creative-art',
      vibe_slug: 'creative-mode',
      tags: ['creative', 'art', 'colorful', 'drawing', 'fun'],
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 88,
      why_like: ['200gsm cold-press textured paper', '180° lay-flat thread binding', 'Zero bleed-through with wet media', 'Internal rear storage envelope'],
      is_featured: 1
    },
    {
      name: 'ChromaFlow 60 Dual-Tip Alcohol Brush Marker Set',
      slug: 'chromaflow-60-brush-markers',
      description: 'Professional double-ended art markers with flexible Japanese brush tips and broad chisel tips. Quick-drying, streak-free blendable ink.',
      price: 1899,
      original_price: 2799,
      discount: 32,
      stock: 14,
      category_slug: 'creative-art',
      vibe_slug: 'creative-mode',
      tags: ['creative', 'art', 'colorful', 'markers', 'design'],
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 115,
      why_like: ['60 vibrant artist-grade colors', 'Flexible Japanese nylon brush nibs', 'Seamless seamless color blending', 'Includes organizer zipper case'],
      is_featured: 1
    },
    {
      name: 'FlowSketch 10-Inch Wireless Drawing Tablet',
      slug: 'flowsketch-wireless-drawing-tablet',
      description: 'Battery-free stylus with 8192 levels of pressure sensitivity, tilt recognition, and customizable shortcut express dials for graphic designers.',
      price: 3699,
      original_price: 4999,
      discount: 26,
      stock: 10,
      category_slug: 'desk-tech',
      vibe_slug: 'creative-mode',
      tags: ['creative', 'tech', 'digital', 'art', 'design'],
      image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 57,
      why_like: ['8192 pen pressure sensitivity', 'Battery-free passive stylus', 'Works with Photoshop, Figma, Blender', 'Slim 7mm aluminum chassis'],
      is_featured: 1
    },
    {
      name: 'Solid Walnut Modular Studio Desk Organizer',
      slug: 'solid-walnut-modular-desk-organizer',
      description: 'Magnetic modular blocks crafted from real American walnut and brass accents. Slot in pens, rulers, sticky notes, and phones effortlessly.',
      price: 1499,
      original_price: 2199,
      discount: 31,
      stock: 16,
      category_slug: 'desk-tech',
      vibe_slug: 'creative-mode',
      tags: ['creative', 'minimal', 'desk', 'organization'],
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 34,
      why_like: ['Authentic solid walnut wood', 'Customizable magnetic modules', 'Weighted felt scratch-free base', 'Minimalist architectural lines'],
      is_featured: 0
    },
    {
      name: 'Studio Beechwood Tabletop Display & Painting Easel',
      slug: 'studio-beechwood-tabletop-easel',
      description: 'Adjustable H-frame wooden tabletop easel with rubber non-slip feet and smooth brass knob locks. Holds canvases up to 60cm height.',
      price: 999,
      original_price: 1499,
      discount: 33,
      stock: 20,
      category_slug: 'creative-art',
      vibe_slug: 'creative-mode',
      tags: ['creative', 'art', 'studio', 'craft'],
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 29,
      why_like: ['Oiled German beechwood', 'Folds into compact carrying frame', 'Supports canvases up to 24 inches', 'Sturdy anti-wobble joints'],
      is_featured: 0
    },

    // --- MAIN CHARACTER ---
    {
      name: 'Vanguard Bauhaus Minimalist Black Steel Watch',
      slug: 'vanguard-bauhaus-steel-watch',
      description: 'Sleek 40mm matte black stainless steel case with sapphire-coated crystal glass, Japanese quartz movement, and interchangeable quick-release strap.',
      price: 2999,
      original_price: 4499,
      discount: 33,
      stock: 15,
      category_slug: 'accessories',
      vibe_slug: 'main-character',
      tags: ['main-character', 'style', 'street', 'minimal', 'watch'],
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 140,
      why_like: ['Ultra-slim 7.2mm profile', 'Sapphire crystal scratch resistance', '5 ATM water resistance', 'Timeless Bauhaus dial'],
      is_featured: 1
    },
    {
      name: 'Retro Noir Polarized Square Acetate Sunglasses',
      slug: 'retro-noir-polarized-sunglasses',
      description: 'Handcrafted Italian acetate frames with TAC polarized UV400 dark lenses and heavy-duty 5-barrel hinges. Unmatched swagger.',
      price: 1399,
      original_price: 2199,
      discount: 36,
      stock: 25,
      category_slug: 'accessories',
      vibe_slug: 'main-character',
      tags: ['main-character', 'style', 'street', 'accessories'],
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 91,
      why_like: ['100% UV400 polarized clarity', 'Handmade cellulose acetate', 'Solid 5-barrel metal hinges', 'Includes hard leather case'],
      is_featured: 1
    },
    {
      name: 'Apex Tactical Streetwear Crossbody Sling Bag',
      slug: 'apex-streetwear-crossbody-sling',
      description: 'Water-resistant ripstop sling with quick-release Fidlock magnetic buckle, padded phone sleeve, and hidden anti-theft passport pocket.',
      price: 1699,
      original_price: 2499,
      discount: 32,
      stock: 19,
      category_slug: 'accessories',
      vibe_slug: 'main-character',
      tags: ['main-character', 'street', 'style', 'bag', 'tech'],
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 78,
      why_like: ['Magnetic Fidlock quick release', 'Weatherproof Cordura fabric', 'Fits iPad mini & daily carry', 'Ergonomic ambidextrous strap'],
      is_featured: 1
    },
    {
      name: 'Monochrome Chunky Sole Retro Street Sneakers',
      slug: 'monochrome-chunky-retro-sneakers',
      description: 'Statement streetwear trainers featuring mixed suede and breathable mesh uppers, high-rebound cushioning foam, and sculpted aggressive tread.',
      price: 3499,
      original_price: 4999,
      discount: 30,
      stock: 11,
      category_slug: 'apparel-gear',
      vibe_slug: 'main-character',
      tags: ['main-character', 'street', 'style', 'shoes', 'fashion'],
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      review_count: 65,
      why_like: ['High-rebound cloud foam midsole', 'Premium suede & breathable mesh', 'Sculpted chunky aesthetic', 'All-day walking comfort'],
      is_featured: 1
    },
    {
      name: 'Matte Onyx Geometric Titanium Signet Ring',
      slug: 'matte-onyx-titanium-signet-ring',
      description: 'Forged from grade 5 hypoallergenic titanium with a hand-set genuine natural black onyx gemstone and beveled satin-brushed edges.',
      price: 899,
      original_price: 1299,
      discount: 30,
      stock: 28,
      category_slug: 'accessories',
      vibe_slug: 'main-character',
      tags: ['main-character', 'style', 'jewelry', 'minimal'],
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      review_count: 49,
      why_like: ['Solid aerospace titanium', 'Genuine natural black onyx', 'Never tarnishes or rusts', 'Comfort-fit curved interior'],
      is_featured: 0
    },
    {
      name: 'Oversized Heavyweight 450GSM French Terry Hoodie',
      slug: 'oversized-heavyweight-french-terry-hoodie',
      description: 'Luxury drop-shoulder streetwear hoodie knitted from 100% combed organic cotton with double-layered hood and seamless kangaroo pocket.',
      price: 2399,
      original_price: 3299,
      discount: 27,
      stock: 14,
      category_slug: 'apparel-gear',
      vibe_slug: 'main-character',
      tags: ['main-character', 'street', 'cozy', 'style', 'apparel'],
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 83,
      why_like: ['Heavyweight 450 GSM organic cotton', 'Structured boxy streetwear drape', 'Pre-shrunk fabric', 'Double-lined deep hood'],
      is_featured: 1
    },
    {
      name: 'Acoustic Brass & Walnut Wireless Bluetooth Speaker',
      slug: 'acoustic-brass-walnut-speaker',
      description: 'Vintage-modern desk speaker featuring real brushed brass knobs, deep bass subwoofer, walnut wooden cabinet, and 18-hour wireless playtime.',
      price: 3299,
      original_price: 4599,
      discount: 28,
      stock: 9,
      category_slug: 'desk-tech',
      vibe_slug: 'chill-mode',
      tags: ['chill', 'tech', 'audio', 'minimal', 'home'],
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      review_count: 51,
      why_like: ['Warm analog sound acoustics', 'Brushed brass tactile control knobs', 'Solid acoustic walnut enclosure', '18hr battery + Aux port'],
      is_featured: 1
    }
  ];

  for (const p of products) {
    const category_id = catMap[p.category_slug] || null;
    const vibe_id = vibeMap[p.vibe_slug] || null;
    db.run(
      `INSERT INTO products (
        name, slug, description, price, original_price, discount, stock,
        category_id, vibe_id, tags, image, images, rating, review_count, why_like, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.name,
        p.slug,
        p.description,
        p.price,
        p.original_price,
        p.discount,
        p.stock,
        category_id,
        vibe_id,
        JSON.stringify(p.tags),
        p.image,
        JSON.stringify([p.image]),
        p.rating,
        p.review_count,
        JSON.stringify(p.why_like),
        p.is_featured
      ]
    );
  }

  console.log('--- Seeding Demo Users ---');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const userPasswordHash = await bcrypt.hash('password123', salt);

  // Admin user
  const adminRes = db.run(
    `INSERT INTO users (name, email, password_hash, role, favorite_vibe, avatar, phone, address, city, state, postal_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Aarav Sharma (Admin)',
      'admin@vibecart.com',
      adminPasswordHash,
      'admin',
      'Main Character',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      '+91 98765 43210',
      '404 Innovation Hub, Cyber City',
      'Bengaluru',
      'Karnataka',
      '560100'
    ]
  );

  // Customer user
  const userRes = db.run(
    `INSERT INTO users (name, email, password_hash, role, favorite_vibe, avatar, phone, address, city, state, postal_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Priya Patel',
      'user@vibecart.com',
      userPasswordHash,
      'user',
      'Study Mode',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      '+91 91234 56789',
      'Flat 302, Green Glen Layout, Bellandur',
      'Bengaluru',
      'Karnataka',
      '560103'
    ]
  );

  // Initialize carts for users
  db.run('INSERT INTO carts (user_id) VALUES (?)', [adminRes.lastInsertRowid]);
  const userCartRes = db.run('INSERT INTO carts (user_id) VALUES (?)', [userRes.lastInsertRowid]);

  // Seed sample items in user's cart
  const sampleProduct1 = db.get('SELECT id FROM products WHERE slug = ?', ['minimalist-matte-desk-lamp']);
  const sampleProduct2 = db.get('SELECT id FROM products WHERE slug = ?', ['daily-flow-productivity-planner']);
  if (sampleProduct1 && sampleProduct2) {
    db.run('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [userCartRes.lastInsertRowid, sampleProduct1.id, 1]);
    db.run('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [userCartRes.lastInsertRowid, sampleProduct2.id, 1]);
  }

  // Seed sample wishlist items for customer
  const wishlistProduct1 = db.get('SELECT id FROM products WHERE slug = ?', ['silencepro-anc-headphones']);
  const wishlistProduct2 = db.get('SELECT id FROM products WHERE slug = ?', ['vanguard-bauhaus-steel-watch']);
  if (wishlistProduct1 && wishlistProduct2) {
    db.run('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userRes.lastInsertRowid, wishlistProduct1.id]);
    db.run('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userRes.lastInsertRowid, wishlistProduct2.id]);
  }

  console.log('--- Seeding Sample Orders ---');
  // Order 1: Delivered
  const order1Res = db.run(
    `INSERT INTO orders (
      order_number, user_id, subtotal, discount, shipping_fee, total_amount,
      payment_method, payment_status, status,
      shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal_code,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-5 days'))`,
    [
      'VB-2026-88102',
      userRes.lastInsertRowid,
      3499,
      0,
      0,
      3499,
      'UPI (Google Pay)',
      'completed',
      'Delivered',
      'Priya Patel',
      'user@vibecart.com',
      '+91 91234 56789',
      'Flat 302, Green Glen Layout, Bellandur',
      'Bengaluru',
      'Karnataka',
      '560103'
    ]
  );
  if (sampleProduct1) {
    db.run(
      `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, vibe_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order1Res.lastInsertRowid, sampleProduct1.id, 'SilencePro Active Noise-Cancelling Headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 3499, 1, 'Study Mode']
    );
  }

  // Order 2: In-Transit / Shipped
  const order2Res = db.run(
    `INSERT INTO orders (
      order_number, user_id, subtotal, discount, shipping_fee, total_amount,
      payment_method, payment_status, status,
      shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_postal_code,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 day'))`,
    [
      'VB-2026-94218',
      userRes.lastInsertRowid,
      1548,
      200,
      0,
      1348,
      'Credit Card (MasterCard)',
      'completed',
      'Shipped',
      'Priya Patel',
      'user@vibecart.com',
      '+91 91234 56789',
      'Flat 302, Green Glen Layout, Bellandur',
      'Bengaluru',
      'Karnataka',
      '560103'
    ]
  );
  if (sampleProduct2) {
    db.run(
      `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, vibe_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order2Res.lastInsertRowid, sampleProduct2.id, 'Daily Flow Productivity Planner', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', 649, 1, 'Study Mode']
    );
  }

  console.log('--- Seeding Sample Reviews ---');
  const reviewProducts = db.query('SELECT id FROM products LIMIT 5');
  const sampleComments = [
    { rating: 5, comment: 'Hands down the best purchase I made this semester. Matches my desk vibe completely!' },
    { rating: 5, comment: 'Premium feel, fantastic build quality. Exceeded expectations!' },
    { rating: 4, comment: 'Really good aesthetic. Delivery was speedy and packaging was crisp.' }
  ];

  for (let i = 0; i < reviewProducts.length; i++) {
    const p = reviewProducts[i];
    const c = sampleComments[i % sampleComments.length];
    db.run(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [p.id, userRes.lastInsertRowid, c.rating, c.comment]
    );
  }

  console.log('============================================');
  console.log('🎉 VIBECART DATABASE SEEDED SUCCESSFULLY! 🎉');
  console.log('============================================');
  console.log('Admin Account: admin@vibecart.com / admin123');
  console.log('User Account:  user@vibecart.com  / password123');
  console.log('============================================');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seed };
