import type { Produk } from "./produk";

export type Ulasan = {
  id: number;
  produkId: number;
  nama: string;
  nilai: number;
  komentar?: string;
  status: "menunggu" | "terima" | "tolak";
  balasan?: string;
  produk: Produk;
  createdAt?: string;
};

export type UlasanCreatePayload = {
  produkId: number;
  nama: string;
  nilai: number;
  komentar?: string;
};

export type UlasanUpdatePayload = {
  status?: "menunggu" | "terima" | "tolak";
  balasan?: string;
};

export interface PaginatedUlasanResponse {
  data: Ulasan[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}
