const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.project.findUnique({ where: { slug: 'multan' } });
  if (existing) {
    console.log('Multan project already exists.');
    return;
  }
  
  const multanContentList = await prisma.multanContent.findMany();
  const multanContent = multanContentList.length > 0 ? multanContentList[0] : null;
  
  await prisma.project.create({
    data: {
      name: 'Multan',
      slug: 'multan',
      heroTitle: multanContent?.heroTitle || 'A Vision of Luxury',
      heroDescription: multanContent?.heroDescription || 'Experience unparalleled living in the heart of Multan.',
      heroImageUrl: multanContent?.heroImageUrl || '/mul.jpeg',
      sectionsData: multanContent?.sectionsData || {}
    }
  });
  
  // Create Sahiwal and Sargodha if they don't exist
  await prisma.project.upsert({
    where: { slug: 'sahiwal' },
    update: {},
    create: {
      name: 'Sahiwal',
      slug: 'sahiwal',
      heroTitle: 'A Vision of Luxury',
      heroDescription: 'State-of-the-art residential society in Sahiwal.',
      heroImageUrl: '/mul.jpeg',
      sectionsData: {}
    }
  });
  
  await prisma.project.upsert({
    where: { slug: 'sargodha' },
    update: {},
    create: {
      name: 'Sargodha',
      slug: 'sargodha',
      heroTitle: 'A Vision of Luxury',
      heroDescription: 'An elite housing venture in Sargodha.',
      heroImageUrl: '/mul.jpeg',
      sectionsData: {}
    }
  });
  
  console.log('Seed completed successfully');
}
main().catch(console.error).finally(() => prisma.$disconnect());
