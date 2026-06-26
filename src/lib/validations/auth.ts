import { z } from 'zod';

export const registerSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus ada huruf besar')
    .regex(/[0-9]/, 'Password harus ada angka')
    .regex(/[^A-Za-z0-9]/, 'Password harus ada simbol'),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});
