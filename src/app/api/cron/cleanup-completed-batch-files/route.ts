import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteFile } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

const EXPIRY_DAYS = 30;

export async function GET(_req: Request) {
  // Validate auth header
  const authHeader = _req.headers.get('authorization') || _req.headers.get('Authorization');
  const expectedBearer = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expectedBearer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = {
    enrollmentsChecked: 0,
    uniqueGroups: 0,
    submissionsProcessed: 0,
    filesDeletedOk: 0,
    storageErrors: 0,
    dbFileRowsDeleted: 0,
    dedupedSkipped: 0,
  };

  try {
    const cutoffDate = new Date(Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Fetch completed enrollments older than cutoff
    const enrollments = await prisma.enrollment.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: { lte: cutoffDate },
      },
      include: {
        kelas: { select: { tipe: true, tingkat: true } },
      },
    });
    stats.enrollmentsChecked = enrollments.length;

    // Dedupe by userId + tipe + tingkat
    const seenGroups = new Set<string>();
    const groups: { userId: string; tipe: any; tingkat: any }[] = [];

    for (const e of enrollments) {
      if (!e.kelas.tipe && !e.kelas.tingkat) {
        stats.dedupedSkipped++;
        continue;
      }
      const key = `${e.userId}|${e.kelas.tipe || '_'}|${e.kelas.tingkat || '_'}`;
      if (seenGroups.has(key)) {
        stats.dedupedSkipped++;
        continue;
      }
      seenGroups.add(key);
      groups.push({ userId: e.userId, tipe: e.kelas.tipe, tingkat: e.kelas.tingkat });
    }
    stats.uniqueGroups = groups.length;

    for (const g of groups) {
      // Find related Tugas for this tipe+tingkat
      const relatedTugas = await prisma.tugas.findMany({
        where: {
          tipeKelas: g.tipe,
          tingkatBIPA: g.tingkat,
        },
        select: { id: true },
      });
      if (relatedTugas.length === 0) continue;
      const tugasIds = relatedTugas.map((t) => t.id);

      // Find submissions for this user on these tugas, with files
      const submissions = await prisma.tugasSubmission.findMany({
        where: {
          userId: g.userId,
          tugasId: { in: tugasIds },
        },
        include: { files: { select: { id: true, fileUrl: true } } },
      });

      for (const s of submissions) {
        if (s.files.length === 0) continue;
        stats.submissionsProcessed++;

        // Delete from storage
        const results = await Promise.allSettled(
          s.files.map(async (f) => deleteFile(f.fileUrl, 'tugas-files'))
        );
        results.forEach((res) => {
          if (res.status === 'fulfilled' && 'success' in res.value && res.value.success) {
            stats.filesDeletedOk++;
          } else {
            stats.storageErrors++;
            const err = res.status === 'fulfilled' && 'error' in res.value ? res.value.error : 'unknown';
            console.error('cron cleanup: storage delete error:', err);
          }
        });

        // Delete DB rows for files (NOT deleting submissions themselves)
        const deleted = await prisma.tugasSubmissionFile.deleteMany({
          where: { submissionId: s.id },
        });
        stats.dbFileRowsDeleted += deleted.count;
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'cleanup-completed-batch-files selesai',
      stats,
    });
  } catch (e) {
    console.error('cron cleanup-completed-batch-files fatal:', e);
    return NextResponse.json(
      { error: 'Internal error', details: e instanceof Error ? e.message : String(e), stats },
      { status: 500 }
    );
  }
}
