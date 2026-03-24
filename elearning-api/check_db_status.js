const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.count();
  const categories = await prisma.category.count();
  const settings = await prisma.systemSetting.count();
  const users = await prisma.user.count();
  
  console.log('--- Database Stats ---');
  console.log('Users:', users);
  console.log('Courses:', courses);
  console.log('Categories:', categories);
  console.log('Settings:', settings);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
