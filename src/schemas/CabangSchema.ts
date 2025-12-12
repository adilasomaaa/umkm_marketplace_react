import { z } from "zod";

export const cabangSchema = z.object({
  nama_cabang: z.string(),
  tipe: z.string(),
  alamat: z.string(),
  status: z.enum(["aktif", "nonaktif"]),
});

export type CabangSchema = z.infer<typeof cabangSchema>;
