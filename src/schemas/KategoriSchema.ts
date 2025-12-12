import { z } from "zod";

export const kategoriSchema = z.object({
  nama_kategori: z.string(),
  tipe: z.enum(["toko", "produk"]),
  icon: z.string(),
});

export type KategoriSchema = z.infer<typeof kategoriSchema>;
