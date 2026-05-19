const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// 1. المستخدمين والموظفين
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const user = await prisma.user.create({ data: req.body });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: "رقم الجوال مسجل مسبقاً" });
    }
});

app.post('/api/login', async (req, res) => {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || user.password !== password) {
        return res.status(400).json({ error: "بيانات الدخول غير صحيحة" });
    }
    res.json(user);
});

app.get('/api/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.post('/api/users', async (req, res) => {
    try {
        const user = await prisma.user.create({ data: req.body });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: "رقم الجوال مسجل مسبقاً لشخص آخر!" });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "تم الحذف" });
});

// ==========================================
// 2. الأقسام
// ==========================================
app.get('/api/categories', async (req, res) => {
    const categories = await prisma.category.findMany({ include: { products: true } });
    res.json(categories);
});
app.post('/api/categories', async (req, res) => {
    const category = await prisma.category.create({ data: req.body });
    res.json(category);
});
app.delete('/api/categories/:id', async (req, res) => {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "تم الحذف" });
});

// ==========================================
// 3. المنتجات
// ==========================================
app.get('/api/products', async (req, res) => {
    const products = await prisma.product.findMany();
    res.json(products);
});
app.post('/api/products', async (req, res) => {
    const product = await prisma.product.create({ data: req.body });
    res.json(product);
});
app.put('/api/products/:id/toggle', async (req, res) => {
    const { isAvailable } = req.body;
    const product = await prisma.product.update({
        where: { id: parseInt(req.params.id) },
        data: { isAvailable }
    });
    res.json(product);
});
app.delete('/api/products/:id', async (req, res) => {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "تم الحذف" });
});

// ==========================================
// 4. الفروع
// ==========================================
app.get('/api/branches', async (req, res) => {
    const branches = await prisma.branch.findMany();
    res.json(branches);
});
app.post('/api/branches', async (req, res) => {
    const branch = await prisma.branch.create({ data: req.body });
    res.json(branch);
});
app.delete('/api/branches/:id', async (req, res) => {
    await prisma.branch.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "تم الحذف" });
});

// ==========================================
// 5. الطلبات
// ==========================================
app.get('/api/orders', async (req, res) => {
    const orders = await prisma.order.findMany();
    res.json(orders);
});
app.post('/api/orders', async (req, res) => {
    const { userId, customerName, orderType, branch, totalPrice, items, paymentStatus } = req.body;
    const order = await prisma.order.create({
        data: { userId, customerName, orderType, branch, totalPrice, paymentStatus, items: JSON.stringify(items) }
    });
    res.json(order);
});
app.put('/api/orders/:id', async (req, res) => {
    const { status } = req.body;
    const order = await prisma.order.update({
        where: { id: parseInt(req.params.id) },
        data: { status }
    });
    res.json(order);
});

// ==========================================
// إعدادات التشغيل للإنترنت (تم التعديل هنا)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ خادم مطعم أبو مهل يعمل الآن على المنفذ ${PORT}`));
