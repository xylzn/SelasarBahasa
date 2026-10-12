import { createClient } from '@supabase/supabase-js';
import { fileTypeFromBuffer } from 'file-type';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_PDF_MIMES = ['application/pdf'] as const;

type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];
type AllowedPdfMime = (typeof ALLOWED_PDF_MIMES)[number];

/**
 * SECURITY — Detect actual file content type from magic bytes (file signature)
 * instead of trusting client-supplied `file.type` or filename extension.
 *
 * Reads the first 4100 bytes (covers PNG/JPEG/WEBP/PDF header + minimal
 * chunk required by file-type detectors).
 *
 * @returns detected MIME string or null if unrecognized
 */
async function detectRealMime(file: File): Promise<string | null> {
  try {
    const sampleSize = Math.min(file.size, 4100);
    const buffer = Buffer.from(await file.slice(0, sampleSize).arrayBuffer());
    const detected = await fileTypeFromBuffer(buffer);
    return detected?.mime ?? null;
  } catch (err) {
    console.error('Magic bytes detection failed:', err);
    return null;
  }
}

/**
 * Upload file to Supabase Storage
 * @param file File to upload
 * @param bucket Storage bucket name (e.g., 'materi-files', 'tugas-files')
 * @param path Optional path in bucket (e.g., '2025/06/')
 * @returns Object with url or error
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path?: string
): Promise<{ url: string; fileName: string; fileSize: number } | { error: string }> {
  try {
    // ── SECURITY: Magic-bytes validation ──────────────────────────────────────
    // Always sniff content FIRST before any size check on any bucket. This prevents
    // polyglot / renamed extension attacks and Content-Type spoofing.
    const realMime = await detectRealMime(file);

    // Validate file size and type based on bucket
    if (bucket === 'materi-files') {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        return { error: 'Ukuran file materi tidak boleh lebih dari 2MB' };
      }
      if (realMime == null || !ALLOWED_PDF_MIMES.includes(realMime as AllowedPdfMime)) {
        return { error: 'File materi harus berupa PDF (terdeteksi otomatis dari konten file)' };
      }
    } else if (bucket === 'tugas-files') {
      if (file.size > 10 * 1024 * 1024) { // 10MB per file
        return { error: 'Ukuran file tugas tidak boleh lebih dari 10MB' };
      }
      // tugas-files accepts arbitrary documents — skip strict mime allowlist to support
      // .doc(x), .ppt(x), .zip etc but still require a recognized file signature
      // to block raw executable / html polyglot uploads.
      if (realMime == null) {
        return { error: 'Tipe file tugas tidak terdeteksi. Pastikan file tidak rusak.' };
      }
      if ([
        'application/x-msdownload', 'application/x-executable',
        'application/x-sharedlib', 'application/x-mach-binary',
        'application/x-elf', 'text/html', 'application/xhtml+xml',
        'application/javascript', 'text/javascript',
      ].includes(realMime)) {
        return { error: 'Tipe file tugas ini tidak diizinkan untuk keamanan.' };
      }
    } else if (bucket === 'profile-photos') {
      if (file.size > 1 * 1024 * 1024) { // 1MB
        return { error: 'Ukuran foto profil tidak boleh lebih dari 1MB' };
      }
      if (realMime == null || !ALLOWED_IMAGE_MIMES.includes(realMime as AllowedImageMime)) {
        return { error: 'Foto profil harus berupa JPG, PNG, atau WEBP (terdeteksi otomatis)' };
      }
    } else if (bucket === 'pengumuman') {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        return { error: 'Ukuran foto dokumentasi tidak boleh lebih dari 2MB' };
      }
      if (realMime == null || !ALLOWED_IMAGE_MIMES.includes(realMime as AllowedImageMime)) {
        return { error: 'Foto dokumentasi harus berupa JPG, PNG, atau WEBP (terdeteksi otomatis)' };
      }
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = path ? `${path}${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[uploadFile] Supabase error:', uploadError.message);
      return { error: 'Gagal mengunggah berkas. Silakan coba beberapa saat lagi.' };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
    };
  } catch (err) {
    console.error('Upload file error:', err);
    return { error: 'Terjadi kesalahan saat upload file' };
  }
}

// For backward compatibility with @/lib/supabase-materi
export async function uploadMateriFile(file: File) {
  const result = await uploadFile(file, 'materi-files');
  if ('error' in result) {
    throw new Error(result.error);
  }
  return result.url;
}

// For backward compatibility with TugasForm
export async function uploadFileToSupabase(
  file: File,
  bucket: string,
  path?: string
) {
  const result = await uploadFile(file, bucket, path);
  if ('error' in result) {
    throw new Error(result.error);
  }
  return result;
}

/**
 * Generate a short-lived signed URL for a private file in Supabase Storage.
 *
 * @param publicUrl  The public URL stored in DB (used to extract the file path)
 * @param bucket     Storage bucket name (e.g., 'materi-files')
 * @param expiresIn  Seconds until the signed URL expires (default 300 = 5 min)
 * @returns signed URL string, or throws on error
 */
export async function createSignedUrl(
  publicUrl: string,
  bucket: string,
  expiresIn = 300
): Promise<string> {
  // Extract the file path from the public URL.
  // Public URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const url = new URL(publicUrl);
  const prefix = `/storage/v1/object/public/${bucket}/`;
  if (!url.pathname.startsWith(prefix)) {
    throw new Error(`URL does not belong to bucket '${bucket}': ${publicUrl}`);
  }
  const filePath = url.pathname.slice(prefix.length);

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? 'unknown error'}`);
  }

  return data.signedUrl;
}

/**
 * Delete file from Supabase Storage
 * @param url Full public URL of the file
 * @param bucket Storage bucket name
 */
export async function deleteFile(url: string, bucket: string): Promise<{ success: boolean } | { error: string }> {
  try {
    // Extract file path from URL
    // URL format: https://<supabaseUrl/storage/v1/object/public/<bucket>/<filePath>
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === bucket);
    if (bucketIndex === -1) {
      return { error: 'Invalid file URL' };
    }
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return { error: `Gagal menghapus file: ${error.message}` };
    }

    return { success: true };
  } catch (err) {
    console.error('Delete file error:', err);
    return { error: 'Terjadi kesalahan saat menghapus file' };
  }
}
