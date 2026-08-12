import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existing = await prisma.project.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      return NextResponse.json({ error: 'Project with this slug already exists' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        slug: data.slug,
        heroTitle: data.heroTitle || 'A Vision of Luxury',
        heroDescription: data.heroDescription || 'Experience unparalleled living.',
        heroImageUrl: data.heroImageUrl || '/mul.jpeg',
        sectionsData: data.sectionsData || {
          heroSubTitle: 'Premium Real Estate',
          overviewTitle: 'Project Overview',
          overviewParagraph2: '',
          overviewImage: '',
          amenitiesSubtitle: 'World Class Facilities',
          amenities: [],
          masterPlansSubtitle: 'Our Master Plans',
          masterPlans: [],
          gallerySubtitle: 'Latest Progress',
          gallery: []
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
