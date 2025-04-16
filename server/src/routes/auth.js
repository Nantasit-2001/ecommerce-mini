const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient'); // ใช้ได้เพราะอยู่ src เดียวกัน
const router = express.Router();

// สมัครสมาชิก (Sign Up)
router.post('/signup', async (req, res) => {
    console.log("Request body:", req.body); // พิมพ์ข้อมูลที่รับมาจาก client
    const { email, password, name } = req.body; // เพิ่ม name ที่ได้รับจาก client
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // เข้ารหัสรหัสผ่าน
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name, // ส่ง name ไปด้วย
            },
        });
        res.status(201).json(user);
    } catch (error) {
        console.error('Sign Up Error:', error); // ดูรายละเอียด error
        res.status(500).json({ error: 'Failed to create user' });
    }
});


module.exports = router;
