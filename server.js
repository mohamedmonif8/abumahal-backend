const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// ================= 1. نظام المصادقة (Auth) =================

// تسجيل مستخدم جديد (موظف أو عميل)
app.post('/api/register', async (req, res) => {
  const { name, phone, password, role, branch } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, phone, password, role: role || 'عميل', branch }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "رقم الجوال مسجل مسبقاً" });
  }
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await prisma.user.findFirst({ where: { phone, password } });
  if (user) res.json(user);
  else res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
});

// جلب جميع المستخدمين
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// حذف مستخدم
app.delete('/api/users/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

// تحديث مستخدم
app.put('/api/users/:id', async (req, res) => {
  const user = await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(user);
});

// ================= 2. إدارة الفروع (Branches) =================

app.get('/api/branches', async (req, res) => {
  const branches = await prisma.branch.findMany();
  res.json(branches);
});

app.post('/api/branches', async (req, res) => {
  const branch = await prisma.branch.create({ data: req.body });
  res.json(branch);
});

app.put('/api/branches/:id', async (req, res) => {
  const branch = await prisma.branch.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(branch);
});

app.delete('/api/branches/:id', async (req, res) => {
  await prisma.branch.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

// ================= 3. إدارة المنيو (Categories & Products) =================

// الأقسام
app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany({ include: { products: true } });
  res.json(categories);
});

app.post('/api/categories', async (req, res) => {
  const category = await prisma.category.create({ data: req.body });
  res.json(category);
});

app.put('/api/categories/:id', async (req, res) => {
  const category = await prisma.category.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(category);
});

app.delete('/api/categories/:id', async (req, res) => {
  await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

// المنتجات
app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ include: { category: true } });
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = await prisma.product.create({ data: req.body });
  res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
  const product = await prisma.product.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

// تفعيل/إيقاف منتج (للمطبخ)
app.put('/api/products/:id/toggle', async (req, res) => {
  const { isAvailable } = req.body;
  const product = await prisma.product.update({
    where: { id: parseInt(req.params.id) },
    data: { isAvailable }
  });
  res.json(product);
});

// ================= 4. إدارة الطلبات (Orders) =================

// إنشاء طلب جديد
app.post('/api/orders', async (req, res) => {
  const { userId, customerName, orderType, branch, totalPrice, items, paymentStatus } = req.body;
  const order = await prisma.order.create({
    data: {
      userId,
      customerName,
      orderType,
      branch,
      totalPrice,
      items: JSON.stringify(items),
      paymentStatus,
      status: 'قيد الانتظار'
    }
  });
  res.json(order);
});

// جلب جميع الطلبات
app.get('/api/orders', async (req, res) => {
  const orders = await prisma.order.findMany();
  res.json(orders);
});

// جلب طلبات مستخدم معين (للعميل)
app.get('/api/orders/user/:userId', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: parseInt(req.params.userId) }
  });
  res.json(orders);
});

// تحديث حالة الطلب (للمطبخ)
app.put('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: parseInt(req.params.id) },
    data: { status }
  });
  res.json(order);
});

app.delete('/api/orders/:id', async (req, res) => {
  await prisma.order.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

// ================= 5. تشغيل السيرفر =================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
