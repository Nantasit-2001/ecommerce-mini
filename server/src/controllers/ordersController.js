const prisma = require('../prismaClient');

exports.createOrder = async (req, res) => {
  const userId = req.user.userId;

  try {
    // 1. ดึง cart ของ user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // 2. คำนวณ total
    const total = cartItems.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    // 3. สร้าง order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        orderItems: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      },
      include: { orderItems: true }
    });

    // 4. ล้าง cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};