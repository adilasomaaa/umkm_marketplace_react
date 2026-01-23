import { z } from "zod";

export const sosialMediaSchema = z.object({
  nama: z.string(),
  url: z.string(),
  tipe: z.enum(["facebook", "instagram", "twitter", "tiktok", "youtube"]),
});

export type SosialMediaSchema = z.infer<typeof sosialMediaSchema>;
