const express = require('express');
const router = express.Router();
const vibeController = require('../controllers/vibeController');

router.get('/', vibeController.getVibes);
router.post('/recommend', vibeController.recommendProducts);

module.exports = router;
