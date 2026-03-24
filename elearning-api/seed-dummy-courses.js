const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { id: 'cat_tech', name: 'Technology & IT', description: 'เรียนรู้ทักษะทางเทคโนโลยีและการเขียนโปรแกรม' },
  { id: 'cat_biz', name: 'Business & Management', description: 'พัฒนาทักษะทางธุรกิจ การบริหาร และการจัดการ' },
  { id: 'cat_design', name: 'Design & Creativity', description: 'ศิลปะ การออกแบบ และความคิดสร้างสรรค์' },
  { id: 'cat_personal', name: 'Personal Development', description: 'พัฒนาตัวเอง ทักษะการสื่อสาร และจิตใจ' }
];

const courses = [
  { title: 'The Ultimate React Bootcamp', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', catId: 'cat_tech', points: 250 },
  { title: 'UX/UI Design Masterclass', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', catId: 'cat_design', points: 300 },
  { title: 'Data Science with Python', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', catId: 'cat_tech', points: 400 },
  { title: 'Leadership in the Modern Workplace', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', catId: 'cat_biz', points: 150 },
  { title: 'Financial Modeling Pro', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80', catId: 'cat_biz', points: 500 },
  { title: 'Public Speaking for Introverts', image: 'https://images.unsplash.com/photo-1475721025505-c310ac4f1568?w=800&q=80', catId: 'cat_personal', points: 100 },
  { title: 'Graphic Design Basics with Illustrator', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80', catId: 'cat_design', points: 200 },
  { title: 'Advanced Cloud Architecture (AWS)', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', catId: 'cat_tech', points: 600 },
  { title: 'Agile Project Management', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80', catId: 'cat_biz', points: 220 },
  { title: 'Photography Fundamentals', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', catId: 'cat_design', points: 120 },
  { title: 'Emotional Intelligence at Work', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', catId: 'cat_personal', points: 180 },
  { title: 'Fullstack Next.js 14 and Vercel', image: 'https://images.unsplash.com/photo-1618477247222-ac60c2800bf9?w=800&q=80', catId: 'cat_tech', points: 350 },
  { title: 'Digital Marketing Strategies 2026', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', catId: 'cat_biz', points: 280 },
  { title: 'Mastering Time Management', image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80', catId: 'cat_personal', points: 90 },
  { title: 'Introduction to Artificial Intelligence', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80', catId: 'cat_tech', points: 450 },
  { title: 'Sales and Negotiation Skills', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', catId: 'cat_biz', points: 260 },
  { title: 'Adobe Premiere Pro Video Editing', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80', catId: 'cat_design', points: 320 },
  { title: 'Mindfulness and Stress Relief', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', catId: 'cat_personal', points: 50 },
  { title: 'Cybersecurity for Developers', image: 'https://images.unsplash.com/photo-1510511459019-5efa7ae51a14?w=800&q=80', catId: 'cat_tech', points: 500 },
  { title: 'Startup Pitch Deck Design', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80', catId: 'cat_biz', points: 190 },
];

async function seed() {
  console.log('Seeding dummy categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name
      }
    });
  }

  console.log('Seeding 20 attractive courses...');
  for (const [index, course] of courses.entries()) {
    const courseId = `dummy_course_${index+1}`;
    await prisma.course.upsert({
      where: { id: courseId },
      update: {
        title: course.title,
        image: course.image,
        categoryId: course.catId,
        points: course.points
      },
      create: {
        id: courseId,
        title: course.title,
        description: `This is an intensive course covering all aspects of ${course.title}. Learn from industry experts and elevate your career.`,
        image: course.image,
        categoryId: course.catId,
        points: course.points
      }
    });

    // Ensure it has at least 1 lesson so the progress bar / hours can be mocked
    await prisma.lesson.upsert({
      where: { id: `dummy_lesson_${index+1}` },
      update: {},
      create: {
        id: `dummy_lesson_${index+1}`,
        title: 'Introduction & Setup',
        type: 'video',
        content: 'Getting started with the course.',
        duration: '120',
        courseId: courseId,
        order: 1
      }
    });
  }

  console.log('Seeding Complete! Added 20 courses and 4 categories.');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
