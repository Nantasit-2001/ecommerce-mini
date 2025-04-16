const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const { createOrder } = require('../controllers/ordersController');

// POST /orders → สร้างคำสั่งซื้อ
router.post('/', authMiddleware, createOrder);

module.exports = router;