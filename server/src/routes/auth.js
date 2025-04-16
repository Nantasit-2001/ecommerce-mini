const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient'); // ใช้ได้เพราะอยู่ src เดียวกัน
const jwt = require('jsonwebtoken');
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

// ล็อกอิน (Login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // หาผู้ใช้จาก email
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // สร้าง JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
