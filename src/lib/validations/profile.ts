import { z } from 'zod';

export const updateProfileSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(50, 'Nama maksimal 50 karakter').optional(),
  bio: z.string().max(160, 'Bio maksimal 160 karakter').optional().or(z.literal('')),
  negara: z.string().max(50).optional().or(z.literal('')),
  instansi: z.string().max(100).optional().or(z.literal('')),
  noWhatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional(),
});
