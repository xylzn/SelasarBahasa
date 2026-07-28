import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail(to: string, resetUrl: string, nama: string) {
  await resend.emails.send({
    from: 'SelasarBahasa <hello@selasarbahasa.com>',
    to,
    subject: 'Reset Password - SelasarBahasa',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0E46A3;">Halo ${nama},</h2>
        <p>Kami menerima permintaan reset password untuk akun kamu. Klik tombol di bawah untuk membuat password baru. Link ini berlaku selama 1 jam.</p>
        <a href="${resetUrl}" style="display:inline-block; background:#0E46A3; color:#fff; padding:12px 24px; border-radius:12px; text-decoration:none; margin-top:16px;">Reset Password</a>
        <p style="margin-top:24px; color:#666; font-size:13px;">Kalau kamu tidak merasa meminta ini, abaikan saja email ini.</p>
      </div>
    `,
  });
}

export async function sendAccountDeletedEmail(
  to: string,
  nama: string,
  reason: 'admin' | 'inactive'
) {
  const message = reason === 'admin'
    ? 'Akun Anda telah dihapus oleh administrator SelasarBahasa.'
    : 'Akun Anda telah dihapus otomatis karena tidak ada aktivitas login selama lebih dari 6 bulan.';

  await resend.emails.send({
    from: 'SelasarBahasa <hello@selasarbahasa.com>',
    to,
    subject: 'Akun SelasarBahasa Anda Telah Dihapus',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0E46A3;">Halo ${nama},</h2>
        <p>${message}</p>
        <p style="margin-top:16px;">Kalau ini keliru atau Anda ingin bergabung kembali, silakan daftar ulang kapan saja di SelasarBahasa.</p>
        <p style="margin-top:24px; color:#666; font-size:13px;">Kalau Anda merasa ini kesalahan, hubungi tim support kami.</p>
      </div>
    `,
  });
}

export async function sendAccountWarningEmail(to: string, nama: string) {
  await resend.emails.send({
    from: 'SelasarBahasa <hello@selasarbahasa.com>',
    to,
    subject: 'Peringatan: Akun SelasarBahasa Anda Akan Dihapus',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0E46A3;">Halo ${nama},</h2>
        <p>Akun kamu akan dihapus dalam ~2 minggu karena tidak ada aktivitas login selama lebih dari 5 bulan.</p>
        <p>Silakan login sekarang untuk membatalkan penghapusan akun!</p>
        <a href="${process.env.NEXTAUTH_URL}/login" style="display:inline-block; background:#0E46A3; color:#fff; padding:12px 24px; border-radius:12px; text-decoration:none; margin-top:16px;">Login Sekarang</a>
        <p style="margin-top:24px; color:#666; font-size:13px;">Kalau Anda merasa ini kesalahan, hubungi tim support kami.</p>
      </div>
    `,
  });
}

export async function sendRefundRequestEmail(
  adminEmail: string,
  siswaEmail: string,
  siswaNama: string,
  kelasInfo: string,
  alasan: string
) {
  await resend.emails.send({
    from: 'SelasarBahasa <hello@selasarbahasa.com>',
    to: adminEmail,
    subject: `Pengajuan Refund: ${siswaNama}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0F9488;">Pengajuan Refund Baru</h2>
        <p><strong>Nama Siswa:</strong> ${siswaNama}</p>
        <p><strong>Email Siswa:</strong> ${siswaEmail}</p>
        <p><strong>Kelas:</strong> ${kelasInfo}</p>
        <p><strong>Alasan Refund:</strong></p>
        <blockquote style="border-left:4px solid #0F9488;padding:8px 16px;color:#444;">${alasan}</blockquote>
        <p style="margin-top:24px;color:#666;font-size:13px;">
          Silakan tindak lanjuti di Admin Panel SelasarBahasa.
        </p>
      </div>
    `,
  });
}

export async function sendEnrollmentNotificationEmail(data: {
  // Identity
  nama: string;
  email: string;
  noWhatsapp?: string | null;
  // Enrollment
  tipeKelas: string;
  tingkat: string;
  notes: Record<string, unknown>;
}) {
  const notesRows = Object.entries(data.notes)
    .map(([k, v]) => `<tr><td style="padding:4px 12px;color:#555;font-size:13px;">${k}</td><td style="padding:4px 12px;font-size:13px;">${v}</td></tr>`)
    .join('');

  await resend.emails.send({
    from: 'SelasarBahasa <hello@selasarbahasa.com>',
    to: 'selasarbahasa@gmail.com',
    subject: `Pendaftaran Baru: ${data.tipeKelas} ${data.tingkat} — ${data.nama}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#0F9488;">Pendaftaran Kelas Baru</h2>
        <h3 style="margin-bottom:4px;">Data Peserta</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 12px;color:#555;font-size:13px;">Nama</td><td style="padding:4px 12px;font-size:13px;">${data.nama}</td></tr>
          <tr><td style="padding:4px 12px;color:#555;font-size:13px;">Email</td><td style="padding:4px 12px;font-size:13px;">${data.email}</td></tr>
          <tr><td style="padding:4px 12px;color:#555;font-size:13px;">WhatsApp</td><td style="padding:4px 12px;font-size:13px;">${data.noWhatsapp || '-'}</td></tr>
        </table>
        <h3 style="margin-top:16px;margin-bottom:4px;">Detail Kelas</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 12px;color:#555;font-size:13px;">Tipe</td><td style="padding:4px 12px;font-size:13px;">${data.tipeKelas}</td></tr>
          <tr><td style="padding:4px 12px;color:#555;font-size:13px;">Tingkat</td><td style="padding:4px 12px;font-size:13px;">${data.tingkat}</td></tr>
          ${notesRows}
        </table>
        <p style="margin-top:24px;color:#888;font-size:12px;">Dikirim otomatis dari SelasarBahasa.</p>
      </div>
    `,
  });
}

export const sendRefundNotificationEmail = async (
  userName: string,
  userEmail: string,
  alasan: string,
  rekening: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await resend.emails.send({
      from: 'SelasarBahasa <hello@selasarbahasa.com>',
      to: process.env.ADMIN_EMAIL ?? 'selasarbahasa@gmail.com',
      subject: `⚠️ Pengajuan Refund Baru - ${userName}`,
      html: `
        <h2>Ada Pengajuan Refund Baru!</h2>
        <p><strong>Nama Siswa:</strong> ${userName}</p>
        <p><strong>Email Siswa:</strong> ${userEmail}</p>
        <hr />
        <h3>Detail Pengajuan:</h3>
        <p><strong>Alasan Refund:</strong><br/> ${alasan}</p>
        <p><strong>Informasi Rekening / E-Wallet:</strong><br/> ${rekening}</p>
        <br/>
        <p>Silakan cek dashboard Admin untuk mengubah status pendaftaran jika dana sudah ditransfer.</p>
      `,
    });
    if (result.error) {
      console.error('[Refund Email] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }
    console.log('[Refund Email] Sent successfully, id:', result.data?.id);
    return { success: true };
  } catch (err) {
    console.error('[Refund Email] Exception:', err);
    return { success: false, error: String(err) };
  }
};

export async function sendContactFormNotificationEmail(data: {
  nama: string;
  email: string;
  pesan: string;
}) {
  const fromAddress = process.env.RESEND_FROM_ADDRESS || 'SelasarBahasa <hello@selasarbahasa.com>';

  // Email tujuan UTAMA: Titan Mail admin@selasarbahasa.com (Task 3b)
  const primaryTo = 'admin@selasarbahasa.com';
  // Email FALLBACK jika primary gagal: ADMIN_EMAIL env var = selasarbahasa@gmail.com (Task 3c)
  const fallbackTo = process.env.ADMIN_EMAIL || 'selasarbahasa@gmail.com';

  const common = {
    from: fromAddress,
    reply_to: [data.email],
    subject: `Pesan Baru dari Form Kontak - ${data.nama}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
        <h2 style="color:#0F9488;">Pesan Baru dari Form Kontak</h2>
        <h3 style="margin-bottom:4px;">Detail Pengirim</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 12px;color:#555;font-size:13px;">Nama</td><td style="padding:4px 12px;font-size:13px;">${data.nama}</td></tr>
          <tr><td style="padding:4px 12px;color:#555;font-size:13px;">Email</td><td style="padding:4px 12px;font-size:13px;">${data.email}</td></tr>
        </table>
        <h3 style="margin-top:16px;margin-bottom:4px;">Isi Pesan</h3>
        <div style="padding:12px 16px;background:#f6f6f6;border-radius:8px;white-space:pre-wrap;font-size:14px;color:#333;">
          ${data.pesan}
        </div>
        <p style="margin-top:24px;color:#888;font-size:12px;">Dikirim otomatis dari SelasarBahasa — tekan Reply untuk langsung membalas ke pengirim (${data.email}).</p>
      </div>
    `,
  } as const;

  // ── Try 1: Kirim ke alamat PRIMARY (admin@selasarbahasa.com) ─────────────
  try {
    const result = await resend.emails.send({ ...common, to: primaryTo });
    if (result.error) throw new Error(`Resend Error [primary ${primaryTo}]: ${result.error.name} — ${result.error.message}`);
    console.log(`[Contact Email] ✅ Primary OK — sent to ${primaryTo}, id: ${result.data?.id}`);
    return;
  } catch (primaryErr) {
    console.warn(`[Contact Email] ⚠️ Primary failed (${primaryTo}), trying FALLBACK → ${fallbackTo}. Reason:`, primaryErr);

    // ── Try 2: Fallback ke ADMIN_EMAIL (selasarbahasa@gmail.com) ─────────
    try {
      const fallbackResult = await resend.emails.send({ ...common, to: fallbackTo });
      if (fallbackResult.error) throw new Error(`Resend Error [fallback ${fallbackTo}]: ${fallbackResult.error.name} — ${fallbackResult.error.message}`);
      console.log(`[Contact Email] ✅ Fallback OK — sent to ${fallbackTo} (primary failed), id: ${fallbackResult.data?.id}`);
      return;
    } catch (fallbackErr) {
      // Keduanya gagal — throw biar route.ts catch + log FATAL ke Vercel
      throw new Error(
        `[Contact Email] ❌ BOTH EMAIL FAILED!\n` +
        `  Primary (${primaryTo}) err: ${String(primaryErr)}\n` +
        `  Fallback (${fallbackTo}) err: ${String(fallbackErr)}\n` +
        `  > Data pesan sudah TERSIMPAN di DB — bisa cek di Dashboard Admin.`
      );
    }
  }
}
