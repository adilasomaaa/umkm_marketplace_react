import { z } from "zod";

export const produkSchema = z.object({
  nama_produk: z.string(),
  deskripsi: z.string(),
  harga: z.any(),
  kategoriId: z.any(),
  cabangData: z.array(z.object({
    cabangId: z.number(),
    status: z.enum(["tersedia", "habis"])
  })).optional(),
  hashtagIds: z.array(z.number()).optional(),
  thumbnail: z.any().optional(),
  status: z.enum(["tampilkan", "sembunyikan"]).optional(),
});

export type ProdukSchema = z.infer<typeof produkSchema>;
