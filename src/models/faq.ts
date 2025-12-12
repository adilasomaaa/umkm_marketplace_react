import type { Toko } from "./toko";

export type Faq = {
  id: number;
  tokoId: number;
  pertanyaan: string;
  jawaban: string;
  toko: Toko;
  createdAt?: string;
};

export type FaqUpdatePayload = {
  tokoId: number;
  pertanyaan: string;
  jawaban: string;
};

export type FaqCreatePayload = {
  tokoId: number;
  pertanyaan: string;
  jawaban: string;
};

export interface PaginatedFaqResponse {
  data: Faq[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}
