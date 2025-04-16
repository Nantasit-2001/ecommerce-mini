const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const prisma = require('../prismaClient');
const router = express.Router();

// ✅ เพิ่มสินค้าลงในตะกร้า
router.post('/', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  console.log('🟡 Incoming cart data:', { userId, productId, quantity });

  if (!productId || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid productId or quantity' });
  }

  try {
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    let cartItem;

    if (existingItem) {
      console.log('🟠 Product already in cart, updating...');
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      console.log('🟢 Product not in cart, creating new item...');
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });
    }

    res.status(200).json(cartItem);
  } catch (error) {
    console.error('🔴 Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

module.exports = router;