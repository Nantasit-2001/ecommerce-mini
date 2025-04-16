const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}, this is your cart.` });
});

module.exports = router;