import { z } from "zod";

export const pemilikTokoCreateSchema = z.object({
  nama_pemilik: z.string(),
  tokoId: z.string().min(1),
  email: z.string().email(),
});

export type PemilikTokoCreateSchema = z.infer<typeof pemilikTokoCreateSchema>;

export const pemilikTokoUpdateSchema = z.object({
  email: z.string().email(),
  nama: z.string().optional(),
  jabatan: z.string(),
  status: z.enum(["aktif", "nonaktif"]),
});

export type PemilikTokoUpdateSchema = z.infer<typeof pemilikTokoUpdateSchema>;
