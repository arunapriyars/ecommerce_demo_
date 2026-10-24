const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.post('/move-to-cart', wishlistController.moveToCart);
router.delete('/:id', wishlistController.removeFromWishlist);

module.exports = router;
