import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'Admin',
    },
  });

  console.log({ admin });

  const defaultMultanData = {
    heroTitle: 'ROYAL ORCHARD',
    heroDescription: 'Experience unparalleled living in the heart of Multan. Where modern architecture meets serene landscapes.',
    heroImageUrl: '/KeyFeatures/2k.jpg',
    sectionsData: {
      heroSubTitle: 'MULTAN',
      overviewTitle: 'A Vision of Luxury',
      overviewParagraph2: 'The place exclusively chosen to live a peaceful and decent life. Just 9 minutes drive from Multan International Airport, Royal Orchard will comprise an area of approx. 4,000 Kanals with a proper security system. Its plan, design and execution will be in accordance with best international standards. City of Saints, Multan is fastest growing urban center of the country and has become an influential, political and economic center.',
      overviewImage: '/plotsm.jpg',
      amenitiesSubtitle: 'Royal Orchard Multan brings to you the Building Revolution. It all started with a realistic appraisal of your living needs.',
      amenities: [
        { name: "Smart Homes", icon: "Home" },
        { name: "Shopping Plazas", icon: "Building2" },
        { name: "Clinic & Hospital", icon: "Hospital" },
        { name: "Learning Facilities", icon: "GraduationCap" },
        { name: "Ciniplex Cinemas", icon: "Film" },
        { name: "Food Courts", icon: "UtensilsCrossed" },
        { name: "Mini Golf Club", icon: "Flag" },
        { name: "Parks & Playground", icon: "Trees" },
        { name: "Gated Community", icon: "Fence" },
        { name: "Physical Surveillance", icon: "Cctv" },
        { name: "24x7 Security", icon: "ShieldCheck" },
        { name: "Firefighting System", icon: "FireExtinguisher" },
      ],
      masterPlansSubtitle: 'Explore our meticulously designed layouts tailored for a modern lifestyle.',
      masterPlans: [
        { title: 'Residential Plan', image: '' },
        { title: 'Commercial Plan', image: '' }
      ],
      gallery: [
        { image: '' },
        { image: '' },
        { image: '' }
      ],
      videos: [
        { type: 'youtube', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
      ],
      partners: [
        { name: 'Habib Rafiq (Pvt) Ltd', image: '' }
      ],
      news: [
        { date: 'Dec 2024', title: 'Development Progress Update' },
        { date: 'Oct 2024', title: 'New Commercial Block Announced' }
      ],
      contact: {
        multanOffice: 'Gate # 1, Multan Public School Road, Multan',
        islamabadOffice: 'Silver Square Plaza, Plot # 15, Street # 73, Mehr Ali Road, F-11 Markaz Islamabad, Pakistan',
        phones: ['+92 61 6740201-8', '+92 300 0502706-12'],
        uan: '+92 61 111 444 475',
        email: 'sales@royalorchard.pk',
        socials: {
          facebook: '#',
          twitter: '#',
          googlePlus: '#',
          instagram: '#',
          linkedin: '#'
        }
      }
    }
  };

  await prisma.multanContent.deleteMany();
  await prisma.multanContent.create({
    data: defaultMultanData
  });
  console.log("MultanContent seeded successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
