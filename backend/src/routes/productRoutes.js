const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/similar', productController.getSimilarProducts);

// Admin-only endpoints
router.post('/', authenticateUser, requireAdmin, productController.createProduct);
router.put('/:id', authenticateUser, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticateUser, requireAdmin, productController.deleteProduct);

module.exports = router;
