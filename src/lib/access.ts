import prisma from '@/lib/prisma';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContentTarget = {
  tipeKelas: string | null;
  tingkatBIPA: string | null;
};

export type ParsedSlug = {
  tipeKelas: 'REGULER' | 'PRIVAT' | 'ANAK_REMAJA';
  tingkatBIPA: 'BIPA_1' | 'BIPA_2' | 'BIPA_3' | 'BIPA_4' | 'BIPA_5' | 'BIPA_6';
};

// ── Slug Helpers ──────────────────────────────────────────────────────────────

const TIPE_MAP: Record<string, 'REGULER' | 'PRIVAT' | 'ANAK_REMAJA'> = {
  'reguler': 'REGULER',
  'privat': 'PRIVAT',
  'anak-remaja': 'ANAK_REMAJA',
};

const TINGKAT_MAP: Record<string, 'BIPA_1' | 'BIPA_2' | 'BIPA_3' | 'BIPA_4' | 'BIPA_5' | 'BIPA_6'> = {
  'bipa-1': 'BIPA_1',
  'bipa-2': 'BIPA_2',
  'bipa-3': 'BIPA_3',
  'bipa-4': 'BIPA_4',
  'bipa-5': 'BIPA_5',
  'bipa-6': 'BIPA_6',
};

export function parseTingkatSlug(slug: string): ParsedSlug | null {
  const parts = slug.split('-');
  if (parts.length < 2) return null;

  // Ambil bagian pertama untuk tipe (bisa "reguler", "privat", atau "anak" + "remaja")
  let tipeStr: string;
  let tingkatStr: string;

  if (parts[0] === 'anak' && parts[1] === 'remaja') {
    tipeStr = 'anak-remaja';
    tingkatStr = parts.slice(2).join('-');
  } else {
    tipeStr = parts[0];
    tingkatStr = parts.slice(1).join('-');
  }

  const tipeKelas = TIPE_MAP[tipeStr];
  const tingkatBIPA = TINGKAT_MAP[tingkatStr];

  if (!tipeKelas || !tingkatBIPA) return null;

  return { tipeKelas, tingkatBIPA };
}

export function generateTingkatSlug(tipeKelas: string, tingkatBIPA: string): string {
  const tipeSlug = tipeKelas.toLowerCase().replace('_', '-');
  const tingkatSlug = tingkatBIPA.toLowerCase().replace('_', '-');
  return `${tipeSlug}-${tingkatSlug}`;
}

export function tingkatToDisplay(tingkat: string): string {
  return tingkat.replace('_', ' ');
}

export function tipeToDisplay(tipe: string): string {
  const map: Record<string, string> = {
    'REGULER': 'Reguler',
    'PRIVAT': 'Privat',
    'ANAK_REMAJA': 'Anak & Remaja',
  };
  return map[tipe] || tipe;
}

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Get the user's most recent active/relevant enrollment with kelas.
 * Returns null if user has no enrollment in ACTIVE or COMPLETED state.
 */
export async function getEnrollmentAccess(userId: string) {
  return prisma.enrollment.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'COMPLETED'] },
    },
    include: { kelas: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get ALL user's active, waiting, or completed enrollments with kelas.
 * Includes WAITING so students can see kelas on waiting list di dashboard.
 */
export async function getAllUserEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: {
      userId,
      status: { in: ['WAITING', 'ACTIVE', 'COMPLETED'] },
    },
    include: { kelas: true },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Read-only access: ACTIVE or COMPLETED enrollment.
 * Used for materi and video list/detail.
 */
export async function canReadContent(userId: string): Promise<boolean> {
  const e = await getEnrollmentAccess(userId);
  return e !== null;
}

/**
 * Interactive access: ACTIVE enrollment only.
 * Used for tugas submit and quiz submit.
 */
export async function canSubmitContent(
  userId: string
): Promise<{ allowed: boolean; completed: boolean }> {
  const e = await getEnrollmentAccess(userId);
  if (!e) return { allowed: false, completed: false };
  if (e.status === 'COMPLETED') return { allowed: false, completed: true };
  return { allowed: true, completed: false };
}

/**
 * Content-level access check — checks ALL user enrollments!
 *
 * Rules:
 * 1. No enrollment → false
 * 2. tingkatBIPA must match exactly
 * 3. tipeKelas matches exactly → true
 * 4. PRIVAT enrollment can read REGULER content at same tingkat → true
 * 5. Everything else → false
 * 6. If content has no tipeKelas/tingkatBIPA set → fall back to basic canReadContent
 */
export async function canAccessContent(
  userId: string,
  content: ContentTarget
): Promise<boolean> {
  // If content has no restriction set, fall back to basic enrollment check
  if (!content.tipeKelas || !content.tingkatBIPA) {
    return canReadContent(userId);
  }

  const enrollments = await getAllUserEnrollments(userId);
  if (enrollments.length === 0) return false;

  // Check all enrollments
  return enrollments.some(e => {
    // Tingkat must match exactly
    if (e.kelas.tingkat !== content.tingkatBIPA) return false;

    // Exact tipe match
    if (e.kelas.tipe === content.tipeKelas) return true;

    // PRIVAT enrollment can read REGULER content at same tingkat
    if (e.kelas.tipe === 'PRIVAT' && content.tipeKelas === 'REGULER') return true;

    return false;
  });
}

/**
 * Check if user can access a specific tingkat (tipeKelas + tingkatBIPA).
 * Uses the same rules as canAccessContent.
 */
export async function canAccessTingkat(
  userId: string,
  targetTipeKelas: string,
  targetTingkatBIPA: string
): Promise<boolean> {
  const enrollments = await getAllUserEnrollments(userId);
  if (enrollments.length === 0) return false;

  // Cari enrollment yang sesuai aturan
  return enrollments.some(e => {
    // Tingkat harus match
    if (e.kelas.tingkat !== targetTingkatBIPA) return false;
    
    // Exact tipe match
    if (e.kelas.tipe === targetTipeKelas) return true;
    
    // PRIVAT enrollment bisa akses REGULER content di tingkat yang sama
    if (e.kelas.tipe === 'PRIVAT' && targetTipeKelas === 'REGULER') return true;
    
    return false;
  });
}
