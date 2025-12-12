import { z } from "zod";

export const pendaftarSchema = z.object({
  nama_pemilik: z.string(),
  nama_toko: z.string(),
  nib: z.string(),
  email: z.string().email(),
});

export type PendaftarSchema = z.infer<typeof pendaftarSchema>;

export const pendaftarUpdateSchema = z.object({
  status: z.enum(["menunggu", "ditolak", "diterima"]),
});

export type PendaftarUpdateSchema = z.infer<typeof pendaftarUpdateSchema>;
