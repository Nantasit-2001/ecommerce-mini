// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart'); // เพิ่มบรรทัดนี้
const ordersRouter = require('./routes/orders'); // ✅ เพิ่มบรรทัดนี้
const app = express();

// โหลด environment variables จาก .env
dotenv.config();
app.use(cors());  // สำหรับอนุญาตให้ API เข้าถึงจากที่อื่น
app.use(express.json());  // เพื่อให้แปลงข้อมูล JSON ที่ส่งมาจาก client



app.use('/auth', authRoutes); // ตั้งค่าให้ใช้งาน route /auth สำหรับสมัครสมาชิกและเข้าสู่ระบบ
app.use('/products', productRoutes); // ตั้งค่าให้ใช้งาน route /products สำหรับการจัดการสินค้า
app.use('/cart', cartRoutes); 
app.use('/orders', ordersRouter);

// ตั้งค่า Port ที่จะใช้
const PORT = process.env.PORT || 5000;

// API ที่จะแสดงข้อความว่า "Hello World"
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// สั่งให้แอปเริ่มทำงาน
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});