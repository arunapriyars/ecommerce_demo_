const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.use(authenticateUser, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/users', adminController.getAllUsers);

module.exports = router;
