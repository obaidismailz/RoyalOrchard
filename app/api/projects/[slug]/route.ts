import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params;
    const project = await prisma.project.findUnique({
      where: { slug: params.slug }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params;
    const data = await request.json();

    const project = await prisma.project.update({
      where: { slug: params.slug },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        heroTitle: data.heroTitle !== undefined ? data.heroTitle : undefined,
        heroDescription: data.heroDescription !== undefined ? data.heroDescription : undefined,
        heroImageUrl: data.heroImageUrl !== undefined ? data.heroImageUrl : undefined,
        sectionsData: data.sectionsData !== undefined ? data.sectionsData : undefined,
        order: data.order !== undefined ? parseInt(data.order, 10) : undefined,
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ slug: string }> }) {
  try {
    const params = await props.params;
    await prisma.project.delete({
      where: { slug: params.slug }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
