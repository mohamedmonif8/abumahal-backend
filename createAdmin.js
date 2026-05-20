const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.create({
    data: {
      name: 'المدير العام',
      phone: '0500000000',
      password: '123456',
      role: 'مدير'
    }
  });
  console.log('✅ تم إنشاء حساب المدير بنجاح! يمكنك الآن تسجيل الدخول.');
}
main().catch(e => console.error(e)).finally(async () => { await prisma.(); });
