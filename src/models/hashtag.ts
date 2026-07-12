import type { Toko } from "./toko";

export interface Hashtag {
  id: number;
  nama: string;
  tokoId: number;
  toko?: Toko;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedHashtagResponse {
  data: Hashtag[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}
