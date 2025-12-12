import { z } from "zod";

export const produkSchema = z.object({
  nama_produk: z.string(),
  deskripsi: z.string(),
  harga: z.any(),
  kategoriId: z.any(),
  cabangIds: z.array(z.number()).optional(),
  thumbnail: z.any().optional(),
});

export type ProdukSchema = z.infer<typeof produkSchema>;
