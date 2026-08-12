import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Helper to recursively process base64 images in an object/array
async function processBase64Images(obj: any): Promise<any> {
  if (!obj) return obj;
  
  if (typeof obj === 'string' && obj.startsWith('data:image')) {
    const matches = obj.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1];
      const base64Data = matches[2];
      const fileName = `multan-upload-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, base64Data, 'base64');
      
      return `/uploads/${fileName}`;
    }
  }

  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => processBase64Images(item)));
  }

  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = await processBase64Images(obj[key]);
    }
    return newObj;
  }

  return obj;
}

export async function GET() {
  try {
    const content = await prisma.multanContent.findFirst();
    if (!content) {
      return NextResponse.json({ message: 'No content found' }, { status: 404 });
    }
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error('Error fetching Multan content:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { heroTitle, heroDescription, heroImageUrl, sectionsData } = body;

    // Handle heroImageUrl
    heroImageUrl = await processBase64Images(heroImageUrl);
    
    // Handle sectionsData
    sectionsData = await processBase64Images(sectionsData);

    const existing = await prisma.multanContent.findFirst();

    let content;
    if (existing) {
      content = await prisma.multanContent.update({
        where: { id: existing.id },
        data: { heroTitle, heroDescription, heroImageUrl, sectionsData },
      });
    } else {
      content = await prisma.multanContent.create({
        data: { heroTitle, heroDescription, heroImageUrl, sectionsData },
      });
    }

    return NextResponse.json({ message: 'Content updated successfully', content }, { status: 200 });
  } catch (error) {
    console.error('Error updating Multan content:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
