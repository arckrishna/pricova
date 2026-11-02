const express = require('express');
const router = express.Router();
const {
  getPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
} = require('../controllers/platformController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPlatforms)
  .post(protect, admin, createPlatform);

router.route('/:id')
  .put(protect, admin, updatePlatform)
  .delete(protect, admin, deletePlatform);

module.exports = router;
