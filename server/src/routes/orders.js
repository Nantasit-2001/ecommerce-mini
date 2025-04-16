const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middlewares/authMiddleware')
const { createOrder } = require('../controllers/ordersController');

// POST /orders → สร้างคำสั่งซื้อ
router.post('/', authMiddleware, createOrder);

router.get('/', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId; // userId ที่ดึงจาก JWT
      const orders = await prisma.order.findMany({
        where: {
          userId: userId, // เฉพาะคำสั่งซื้อของผู้ใช้
        },
        include: {
          orderItems: true, // ดึงข้อมูล orderItems ด้วย
          payment: true, // ดึงข้อมูลการชำระเงิน (ถ้ามี)
        },
      });
  
      if (!orders) {
        return res.status(404).json({ error: 'No orders found' });
      }
  
      return res.status(200).json(orders); // ส่งข้อมูลคำสั่งซื้อ
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/:orderId', authMiddleware, async (req, res) => {
    const { orderId } = req.params; // ดึง orderId จาก params
    const userId = req.user.userId; // userId ที่ได้จาก JWT
  
    try {
      // ค้นหาคำสั่งซื้อโดยใช้ orderId และ userId
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        include: {
          orderItems: true, // รวมรายการสินค้าที่สั่งซื้อ
          payment: true, // รวมข้อมูลการชำระเงิน (ถ้ามี)
        },
      });
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      if (order.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view this order' });
      }
  
      return res.status(200).json(order); // ส่งข้อมูลคำสั่งซื้อ
    } catch (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });

// PATCH /orders/:orderId - อัปเดตสถานะของคำสั่งซื้อ
router.patch('/:orderId', authMiddleware, async (req, res) => {
    const { orderId } = req.params; // ดึง orderId จาก params
    const userId = req.user.userId; // userId ที่ได้จาก JWT
    const { status } = req.body; // สถานะที่ต้องการอัปเดต
  
    try {
      // ค้นหาคำสั่งซื้อโดยใช้ orderId
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
      });
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      if (order.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update this order' });
      }
  
      // อัปเดตสถานะของคำสั่งซื้อ
      const updatedOrder = await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status },
      });
  
      return res.status(200).json(updatedOrder); // ส่งข้อมูลคำสั่งซื้อที่อัปเดตแล้ว
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;