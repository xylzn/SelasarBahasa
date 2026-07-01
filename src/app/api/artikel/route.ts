import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { z } from 'zod';

// Helper slugify
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// GET /api/artikel
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const kategori = searchParams.get('kategori');

  const artikel = await prisma.article.findMany({
    where: {
      published: true,
      ...(kategori && { kategori }),
    },
    select: {
      id: true,
      judul: true,
      slug: true,
      ringkasan: true,
      thumbnailUrl: true,
      kategori: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json(artikel);
}

// POST /api/artikel
const createArtikelSchema = z.object({
  judul: z.string().min(1),
  slug: z.string().optional(),
  ringkasan: z.string().min(1).max(300),
  isi: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160).optional(),
  ogImageUrl: z.string().optional(),
  kategori: z.string().optional(),
  published: z.boolean().default(false),
});

export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const body = await request.json();
  const validated = createArtikelSchema.parse(body);

  let slug = validated.slug || slugify(validated.judul);
  
  // Check slug uniqueness
  let slugExists = await prisma.article.findUnique({ where: { slug } });
  let counter = 1;
  while (slugExists) {
    slug = `${slugify(validated.judul)}-${counter}`;
    slugExists = await prisma.article.findUnique({ where: { slug } });
    counter++;
  }

  const artikel = await prisma.article.create({
    data: {
      judul: validated.judul,
      slug,
      ringkasan: validated.ringkasan,
      isi: validated.isi,
      thumbnailUrl: validated.thumbnailUrl,
      kategori: validated.kategori,
      metaTitle: validated.metaTitle,
      metaDescription: validated.metaDescription,
      ogImageUrl: validated.ogImageUrl,
      published: validated.published,
      publishedAt: validated.published ? new Date() : null,
    },
  });

  return NextResponse.json(artikel, { status: 201 });
}
