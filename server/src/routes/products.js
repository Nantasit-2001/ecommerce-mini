const express = require('express');
const prisma = require('../prismaClient');
const router = express.Router();

// สร้างสินค้า (Create Product)
router.post('/', async (req, res) => {
    const { name, price, description } = req.body;

    try {
        const product = await prisma.product.create({
            data: {
                name,
                price,
                description,
            },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// อ่านสินค้าทั้งหมด (Read Products)
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// อ่านสินค้าจาก ID (Read Single Product)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// อัพเดตสินค้า (Update Product)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    try {
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price,
                description,
            },
        });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// ลบสินค้า (Delete Product)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;