import { z } from "zod";

export const faqSchema = z.object({
  pertanyaan: z.string(),
  jawaban: z.string(),
});

export type FaqSchema = z.infer<typeof faqSchema>;
