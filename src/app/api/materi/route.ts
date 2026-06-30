import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/api-auth';
import { invalidateCachePattern } from '@/lib/cache';
import { z } from 'zod';
import { uploadMateriFile } from '@/lib/supabase-materi';

// Helper slugify
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// GET /api/materi
export async function GET(request: Request) {
  const session = await requireAuth();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const isPremium = session.user?.role === 'ADMIN' || session.user?.role === 'PREMIUM';

  const materi = await prisma.materi.findMany({
    where: {
      published: true,
      ...(!isPremium && { isPremium: false }),
    },
    select: {
      id: true,
      judul: true,
      slug: true,
      tipe: true,
      isPremium: true,
      urutan: true,
    },
    orderBy: { urutan: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json(materi);
}

// POST /api/materi
export async function POST(request: Request) {
  try {
    await requireAdmin();
    
    // Cek apakah request adalah form data (untuk upload file)
    const contentType = request.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('pdfFile') as File | null;
      
      let pdfUrl = formData.get('pdfUrl') as string | null;
      
      // Kalo ada file yang diupload, upload ke Supabase
      if (file && file.size > 0) {
        pdfUrl = await uploadMateriFile(file);
      }
      
      data = {
        judul: formData.get('judul') as string,
        slug: formData.get('slug') as string || undefined,
        tipe: formData.get('tipe') as 'TEKS' | 'VIDEO',
        kelas: formData.get('kelas') as 'DASAR' | 'MENENGAH' | 'LANJUTAN',
        pdfUrl: pdfUrl || undefined,
        videoUrl: formData.get('videoUrl') as string || undefined,
        isPremium: formData.get('isPremium') === 'true',
        urutan: parseInt(formData.get('urutan') as string) || 0,
        published: formData.get('published') === 'true',
      };
    } else {
      // Kalo JSON biasa
      const body = await request.json();
      const createMateriSchema = z.object({
        judul: z.string().min(1),
        slug: z.string().optional().nullable(),
        tipe: z.enum(['TEKS', 'VIDEO']),
        kelas: z.enum(['DASAR', 'MENENGAH', 'LANJUTAN']).default('DASAR'),
        pdfUrl: z.string().optional().nullable(),
        videoUrl: z.string().optional().nullable(),
        isPremium: z.boolean().default(false),
        urutan: z.number().default(0),
        published: z.boolean().default(true),
        sumberDokumen: z.enum(['LINK', 'UPLOAD']).optional().nullable(),
      });
      data = createMateriSchema.parse(body);
    }

    let slug = data.slug || slugify(data.judul);
    
    // Check slug uniqueness
    let slugExists = await prisma.materi.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(data.judul)}-${counter}`;
      slugExists = await prisma.materi.findUnique({ where: { slug } });
      counter++;
    }

    let videoProvider: 'YOUTUBE' | 'VIMEO' | null = null;
    if (data.videoUrl) {
      if (data.videoUrl.includes('youtube.com') || data.videoUrl.includes('youtu.be')) {
        videoProvider = 'YOUTUBE';
      } else if (data.videoUrl.includes('vimeo.com')) {
        videoProvider = 'VIMEO';
      }
    }

    console.log('Creating materi with data:', {
      ...data,
      slug,
      videoProvider
    });

    const materi = await prisma.materi.create({
      data: {
        ...data,
        slug,
        videoProvider,
      },
    });

    // Invalidate cache
    await invalidateCachePattern('materi:list:*');

    return NextResponse.json(materi, { status: 201 });
  } catch (error) {
    console.error('Error creating materi:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Gagal menambah materi'
    }, { status: 500 });
  }
}
