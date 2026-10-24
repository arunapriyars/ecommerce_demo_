const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, favorite_vibe } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check duplicate email
    const existing = db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}`;
    const selectedVibe = favorite_vibe || 'Chill Mode';

    const result = db.run(
      `INSERT INTO users (name, email, password_hash, role, favorite_vibe, avatar)
       VALUES (?, ?, ?, 'user', ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), password_hash, selectedVibe, defaultAvatar]
    );

    const userId = result.lastInsertRowid;

    // Create user's cart
    db.run('INSERT INTO carts (user_id) VALUES (?)', [userId]);

    const newUser = db.get('SELECT id, name, email, role, favorite_vibe, avatar, created_at FROM users WHERE id = ?', [userId]);
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Account created successfully! Welcome to VibeCart ✨',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = db.get(
      'SELECT id, name, email, password_hash, role, favorite_vibe, avatar, phone, address, city, state, postal_code FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      message: 'Welcome back to your vibe! 👋',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};

exports.getProfile = (req, res) => {
  try {
    const user = db.get(
      `SELECT id, name, email, role, favorite_vibe, avatar, phone, address, city, state, postal_code, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const orderStats = db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [req.user.id]);
    const wishlistStats = db.get('SELECT COUNT(*) as count FROM wishlists WHERE user_id = ?', [req.user.id]);

    res.json({
      user,
      stats: {
        totalOrders: orderStats?.count || 0,
        wishlistCount: wishlistStats?.count || 0
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

exports.updateProfile = (req, res) => {
  try {
    const { name, favorite_vibe, avatar, phone, address, city, state, postal_code } = req.body;

    db.run(
      `UPDATE users 
       SET name = COALESCE(?, name),
           favorite_vibe = COALESCE(?, favorite_vibe),
           avatar = COALESCE(?, avatar),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           state = COALESCE(?, state),
           postal_code = COALESCE(?, postal_code)
       WHERE id = ?`,
      [name, favorite_vibe, avatar, phone, address, city, state, postal_code, req.user.id]
    );

    const updatedUser = db.get(
      `SELECT id, name, email, role, favorite_vibe, avatar, phone, address, city, state, postal_code, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully ✨',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile.' });
  }
};
