const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const prisma = require('../prismaClient');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }, // ดึงข้อมูลสินค้าเข้ามาด้วย
    });

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

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

router.patch('/:id', authMiddleware, async (req, res) => {
  const cartItemId = parseInt(req.params.id);
  const { quantity } = req.body;
  const userId = req.user.userId;

  if (quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Cannot update this item' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const cartItemId = parseInt(req.params.id);
  const userId = req.user.userId;

  try {
    // เช็คก่อนว่าเป็นของ user จริงมั้ย
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete this item' });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    res.json({ message: 'Item deleted from cart' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ error: 'Failed to delete item from cart' });
  }
});

module.exports = router;