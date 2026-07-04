import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail(to: string, resetUrl: string, nama: string) {
  await resend.emails.send({
    from: 'SelasarBahasa <onboarding@resend.dev>', // ganti ke domain sendiri setelah verifikasi domain di Resend
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
    from: 'SelasarBahasa <onboarding@resend.dev>',
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
    from: 'SelasarBahasa <onboarding@resend.dev>',
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

export async function sendPremiumExpiryReminderEmail(to: string, nama: string, expiryDate: Date) {
  const formattedDate = expiryDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  await resend.emails.send({
    from: 'SelasarBahasa <onboarding@resend.dev>',
    to,
    subject: 'Peringatan: Premium SelasarBahasa Anda Akan Habis',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0E46A3;">Halo ${nama},</h2>
        <p>Premium kamu akan habis pada <strong>${formattedDate}</strong>!</p>
        <p>Silakan hubungi tim support kami untuk perpanjangan.</p>
        <p style="margin-top:16px;">WhatsApp: +62 812-3456-7890</p>
        <p style="margin-top:24px; color:#666; font-size:13px;">Kalau Anda merasa ini kesalahan, hubungi tim support kami.</p>
      </div>
    `,
  });
}
