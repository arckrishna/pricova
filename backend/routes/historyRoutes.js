const express = require('express');
const router = express.Router();
const { getPriceHistory } = require('../controllers/historyController');

router.get('/:productId', getPriceHistory);

module.exports = router;
