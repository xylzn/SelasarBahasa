import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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
    // Validate file size and type based on bucket
    if (bucket === 'materi-files') {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        return { error: 'Ukuran file materi tidak boleh lebih dari 2MB' };
      }
      if (file.type !== 'application/pdf') {
        return { error: 'File materi harus berupa PDF' };
      }
    } else if (bucket === 'tugas-files') {
      if (file.size > 10 * 1024 * 1024) { // 10MB per file
        return { error: 'Ukuran file tugas tidak boleh lebih dari 10MB' };
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
      return { error: `Gagal upload file: ${uploadError.message}` };
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
