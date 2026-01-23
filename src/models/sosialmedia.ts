import type { Toko } from "./toko";

export type SosialMedia = {
  id: number;
  nama: string;
  url: string;
  tipe: "facebook" | "instagram" | "twitter" | "tiktok" | "youtube";
  tokoId: number;
  toko: Toko;
  createdAt?: string;
};

export type SosialMediaUpdatePayload = {
  nama: string;
  url: string;
  tipe: string;
  tokoId: number;
};

export type SosialMediaCreatePayload = {
  nama: string;
  url: string;
  tipe: string;
  tokoId: number;
};

export interface PaginatedSosialMediaResponse {
  data: SosialMedia[];
  meta?: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}
