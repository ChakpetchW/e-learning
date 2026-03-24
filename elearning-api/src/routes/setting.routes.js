const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public settings (for all logged in users)
router.get('/', verifyToken, settingController.getSettings);

// Admin only settings update
router.patch('/:key', verifyToken, verifyAdmin, settingController.updateSetting);

module.exports = router;
