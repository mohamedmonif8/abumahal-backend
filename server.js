const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// 1. مسارات تسجيل الدخول والمستخدمين
// ==========================================
app.post('/api/register', async (req, res) => {
    try {
        const { name, phone, password, role, branch } = req.body;
        const user = await prisma.user.create({
            data: { name, phone, password, role: role || 'عميل', branch }
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: "رقم الجوال مسجل مسبقاً أو هناك خطأ في البيانات" });
    }
});

app.post('/api/login', async (req, res) => {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || user.password !== password) {
        return res.status(401).json({ error: "رقم الجوال أو كلمة المرور غير صحيحة" });
    }
    res.json(user);
});

app.get('/api/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.delete('/api/users/:id', async (req, res) => {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "تم الحذف" });
});

// ==========================================
// 2. مسارات الفروع
// ==========================================
app.get('/api/branches', async (req, res) => {
    const branches = await prisma.branch.findMany();
    res.json(branches);
});

app.post('/api/branches', async (req, res) => {
    const { name } = req.body;
    const branch = await prisma.branch.create({ data: { name } });
    res.json(branch);
});

app.delete('/api/branches/:id', async (req, res) => {
    await prisma.branch.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "تم الحذف" });
});

// ==========================================
// 3. مسارات الأقسام
// ==========================================
app.get('/api/categories', async (req, res) => {
    const categories = await prisma.category.findMany({ include: { products: true } });
    res.json(categories);
});

app.post('/api/categories', async (req, res) => {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.json(category);
});

app.delete('/api/categories/:id', async (req, res) => {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "تم الحذف" });
});

// ==========================================
// 4. مسارات المنتجات
// ==========================================
app.get('/api/products', async (req, res) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

app.post('/api/products', async (req, res) => {
    const { name, price, categoryId } = req.body;
    const product = await prisma.product.create({
        data: { name, price: parseFloat(price), categoryId: parseInt(categoryId) }
    });
    res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "تم الحذف" });
});

app.put('/api/products/:id/toggle', async (req, res) => {
    const { isAvailable } = req.body;
    const product = await prisma.product.update({
        where: { id: parseInt(req.params.id) },
        data: { isAvailable }
    });
    res.json(product);
});

// ==========================================
// 5. مسارات الطلبات
// ==========================================
app.get('/api/orders', async (req, res) => {
    const orders = await prisma.order.findMany();
    res.json(orders);
});

app.post('/api/orders', async (req, res) => {
    const { userId, customerName, orderType, branch, totalPrice, items, paymentStatus } = req.body;
    const order = await prisma.order.create({
        data: {
            userId: parseInt(userId),
            customerName,
            orderType,
            branch,
            totalPrice: parseFloat(totalPrice),
            items: JSON.stringify(items),
            paymentStatus
        }
    });
    res.json(order);
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const order = await prisma.order.update({
        where: { id: parseInt(req.params.id) },
        data: { status }
    });
    res.json(order);
});

// ==========================================
// تشغيل الخادم وإنشاء مدير افتراضي تلقائياً
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`✅ خادم مطعم أبو مهل يعمل الآن على المنفذ ${PORT}`);
    
    // التحقق من وجود مدير، وإذا لم يوجد يتم إنشاؤه تلقائياً
    try {
        const adminExists = await prisma.user.findFirst({ where: { role: 'مدير' } });
        if (!adminExists) {
            await prisma.user.create({
                data: {
                    name: 'المدير العام',
                    phone: '0500000000',
                    password: '123456',
                    role: 'مدير'
                }
            });
            console.log('👑 تم إنشاء حساب المدير الافتراضي بنجاح على السيرفر!');
        }
    } catch (error) {
        console.log('⚠️ خطأ أثناء التحقق من حساب المدير:', error.message);
    }
});
