const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, reviewController.addReview);

module.exports = router;
