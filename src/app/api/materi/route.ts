import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/api-auth';
import { invalidateCachePattern, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS } from '@/lib/cache-keys';
import { z } from 'zod';
import { uploadMateriFile } from '@/lib/supabase-materi';
import { canReadContent } from '@/lib/access';

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
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const session = authResult.session;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const isAdminRequest = searchParams.get('admin') === 'true';
  const isAdminUser = session.user?.role === 'ADMIN';

  const userId = session.user?.id as string;
  const hasAccess = isAdminUser ? true : await canReadContent(userId);

  if (isAdminRequest && isAdminUser) {
    // Admin request: return all materi, including unpublished
    const materi = await prisma.materi.findMany({
      select: { id: true, judul: true, slug: true, tipe: true, tipeKelas: true, tingkatBIPA: true, urutan: true, published: true },
      orderBy: { urutan: 'asc' },
    });
    return NextResponse.json(materi);
  }

  const materi = await prisma.materi.findMany({
    where: { published: true },
    select: { id: true, judul: true, slug: true, tipe: true, tipeKelas: true, tingkatBIPA: true, urutan: true },
    orderBy: { urutan: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Filter to only content user can access (enrollment-based)
  const filtered = hasAccess ? materi : [];

  return NextResponse.json(filtered);
}

// POST /api/materi
export async function POST(request: Request) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
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
        tipeKelas: formData.get('tipeKelas') as 'REGULER' | 'PRIVAT' | 'ANAK_REMAJA',
        tingkatBIPA: formData.get('tingkatBIPA') as 'BIPA_1' | 'BIPA_2' | 'BIPA_3' | 'BIPA_4' | 'BIPA_5' | 'BIPA_6',
        pdfUrl: pdfUrl || undefined,
        videoUrl: formData.get('videoUrl') as string || undefined,
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
        tipeKelas: z.enum(['REGULER', 'PRIVAT', 'ANAK_REMAJA']).default('REGULER'),
        tingkatBIPA: z.enum(['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6']).default('BIPA_1'),
        pdfUrl: z.string().optional().nullable(),
        videoUrl: z.string().optional().nullable(),
        deskripsi: z.string().optional().nullable(),
        urutan: z.number().default(0),
        published: z.boolean().default(true),
        sumberDokumen: z.enum(['LINK', 'UPLOAD']).optional().nullable(),
      });
      data = createMateriSchema.parse(body);
    }

    // Generate slug in format: [kelas&tingkat]-[judulmateri]-[jenismateri vid/teks]
    let slug = data.slug;
    if (!slug) {
      const kelasTingkatSlug = `${data.tipeKelas.toLowerCase().replace('_', '-')}-${data.tingkatBIPA.toLowerCase().replace('_', '-')}`;
      const judulSlug = slugify(data.judul);
      const jenisMateriSlug = data.tipe === 'VIDEO' ? 'vid' : 'teks';
      slug = `${kelasTingkatSlug}-${judulSlug}-${jenisMateriSlug}`;
    }
    
    // Check slug uniqueness
    let slugExists = await prisma.materi.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      const kelasTingkatSlug = `${data.tipeKelas.toLowerCase().replace('_', '-')}-${data.tingkatBIPA.toLowerCase().replace('_', '-')}`;
      const judulSlug = slugify(data.judul);
      const jenisMateriSlug = data.tipe === 'VIDEO' ? 'vid' : 'teks';
      slug = `${kelasTingkatSlug}-${judulSlug}-${jenisMateriSlug}-${counter}`;
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
    await invalidateCache(CACHE_KEYS.materiCount());

    return NextResponse.json(materi, { status: 201 });
  } catch (error) {
    console.error('Error creating materi:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Gagal menambah materi'
    }, { status: 500 });
  }
}
