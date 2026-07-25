import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { sendEnrollmentNotificationEmail } from '@/lib/email';

const BIPA_LEVELS = ['BIPA_1', 'BIPA_2', 'BIPA_3', 'BIPA_4', 'BIPA_5', 'BIPA_6'] as const;

const schema = z.object({
  // ── Route A: Reguler / Anak — pick an existing Kelas ─────────────────────
  kelasId: z.string().optional(),

  // ── Route B: Privat — auto-create a dedicated Kelas ──────────────────────
  tipe: z.literal('PRIVAT').optional(),
  tingkat: z.enum(BIPA_LEVELS).optional(),

  // ── Reguler / shared ──────────────────────────────────────────────────────
  pilihanWaktu: z.string().optional(),
  kemampuanBI: z.string().optional(),
  preferredLevel: z.string().optional(),
  preferredClass: z.string().optional(),

  // ── Privat ────────────────────────────────────────────────────────────────
  jumlahPemelajar: z.number().int().min(1).max(4).optional(),
  preferensiJadwal: z.string().optional(),
  usulanWaktu: z.string().optional(),
  preferredDays: z.string().optional(),
  preferredHour: z.string().optional(),
  totalHours: z.number().int().min(10).optional(),
  courseStartDate: z.string().optional(),

  // ── Anak & Remaja ─────────────────────────────────────────────────────────
  namaWali: z.string().optional(),
  umurAnak: z.number().int().min(5).max(18).optional(),
  namaAnak: z.string().optional(),
  ageCategory: z.string().optional(),
  kategoriKelas: z.string().optional(),
  pilihanWaktuAnak: z.string().optional(),
}).refine(
  data => data.kelasId || (data.tipe === 'PRIVAT' && data.tingkat),
  { message: 'Either kelasId or (tipe + tingkat) is required.' }
);

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { kelasId, tipe, tingkat, namaWali, umurAnak, ...rest } = parsed.data;

  // Check for existing active/waiting enrollment
  const existing = await prisma.enrollment.findFirst({
    where: {
      userId: authResult.session.user.id,
      status: { in: ['PENDING_PAYMENT', 'WAITING', 'ACTIVE'] },
    },
  });
  if (existing) {
    return NextResponse.json({ error: 'You are already enrolled in an active class.' }, { status: 409 });
  }

  // ── Resolve Kelas ─────────────────────────────────────────────────────────
  let kelas: { id: string; tipe: string; tingkat: string };

  if (tipe === 'PRIVAT' && tingkat) {
    // Route B — Privat: create a dedicated Kelas, skip WAITING_LIST check entirely.
    // Each Privat registration gets its own slot — no batch, no quota.
    kelas = await prisma.kelas.create({
      data: {
        tipe: 'PRIVAT',
        tingkat,
        status: 'ONGOING',
        minKuota: 1,
        nama: `Private Class — ${tingkat.replace('_', ' ')}`,
      },
    });
  } else if (kelasId) {
    // Route A — Reguler / Anak: join existing Kelas that must be WAITING_LIST
    const found = await prisma.kelas.findUnique({ where: { id: kelasId } });
    if (!found || found.status !== 'WAITING_LIST') {
      return NextResponse.json({ error: 'This class is not open for registration.' }, { status: 400 });
    }
    kelas = found;
  } else {
    return NextResponse.json({ error: 'Invalid registration request.' }, { status: 400 });
  }

  // ── Build notes JSON (same pattern for both routes) ───────────────────────
  const notesObj: Record<string, unknown> = {};

  if (rest.kemampuanBI)      notesObj['Current Indonesian Ability'] = rest.kemampuanBI;
  // IMPORTANT: exact string "Not Sure (needs placement test)" triggers admin badge
  if (rest.preferredLevel)   notesObj['Preferred Level'] = rest.preferredLevel;
  if (rest.preferredClass)   notesObj['Preferred Class'] = rest.preferredClass;
  if (rest.pilihanWaktu)     notesObj['Preferred Hour'] = rest.pilihanWaktu;

  // Privat extras
  if (rest.jumlahPemelajar)  notesObj['Number of Learners'] = rest.jumlahPemelajar;
  if (rest.preferredDays)    notesObj['Preferred Days'] = rest.preferredDays;
  if (rest.preferredHour)    notesObj['Preferred Hour'] = rest.preferredHour;
  if (rest.preferensiJadwal) notesObj['Schedule Preference'] = rest.preferensiJadwal;
  if (rest.usulanWaktu)      notesObj['Proposed Time'] = rest.usulanWaktu;
  if (rest.totalHours)       notesObj['Total Hours'] = rest.totalHours;
  if (rest.courseStartDate)  notesObj['Course Start Date'] = rest.courseStartDate;

  // Anak & Remaja extras
  if (namaWali)              notesObj['Guardian Name'] = namaWali;
  if (umurAnak)              notesObj["Child's Age"] = umurAnak;
  if (rest.namaAnak)         notesObj["Child's Name"] = rest.namaAnak;
  if (rest.ageCategory)      notesObj['Age Category'] = rest.ageCategory;
  if (rest.kategoriKelas)    notesObj['Age Category'] = rest.kategoriKelas;
  if (rest.pilihanWaktuAnak) notesObj['Preferred Hour'] = rest.pilihanWaktuAnak;

  // ── Create Enrollment ─────────────────────────────────────────────────────
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: authResult.session.user.id,
      kelasId: kelas.id,
      status: 'PENDING_PAYMENT',
      namaWali,
      umurAnak,
      notes: Object.keys(notesObj).length > 0 ? JSON.stringify(notesObj) : null,
    },
  });

  // ── Email notification (fire-and-forget) ─────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: authResult.session.user.id },
    select: { nama: true, email: true, noWhatsapp: true },
  });
  if (user) {
    sendEnrollmentNotificationEmail({
      nama: user.nama,
      email: user.email,
      noWhatsapp: user.noWhatsapp,
      tipeKelas: kelas.tipe,
      tingkat: kelas.tingkat,
      notes: notesObj,
    }).catch((err) => console.error('Failed to send enrollment email:', err));
  }

  return NextResponse.json(enrollment, { status: 201 });
}
