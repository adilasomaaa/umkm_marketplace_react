import { z } from "zod";

export const tokoCreateSchema = z.object({
  nama_pemilik: z.string(),
  nib: z.string(),
  nama_toko: z.string(),
  email: z.string().email(),
  status: z.enum(["aktif", "nonaktif", "ditangguhkan"]),
});

export type TokoCreateSchema = z.infer<typeof tokoCreateSchema>;

export const tokoUpdateSchema = z.object({
  nib: z.string(),
  nama_toko: z.string(),
  status: z.enum(["aktif", "nonaktif", "ditangguhkan"]),
});

export type TokoUpdateSchema = z.infer<typeof tokoUpdateSchema>;

export const tokoUpdateClientSchema = z.object({
  nib: z.string().min(3, "Minimal 3 karakter").optional(),
  nama_toko: z.string().min(3, "Minimal 3 karakter").optional(),
  deskripsi: z.string().optional(),
  nomor_hp: z.string().optional(),
  kategori_id: z.array(z.number()).optional(),
  logo: z.any().optional(),
});

export type TokoUpdateClientSchema = z.infer<typeof tokoUpdateClientSchema>;
