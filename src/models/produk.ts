import type { Cabang } from "./cabang";
import type { Kategori } from "./kategori";
import type { Toko } from "./toko";
import type { Hashtag } from "./hashtag";

export type Produk = {
  id: number;
  nama_produk: string;
  totalUlasan: number;
  deskripsi: string;
  slug: string;
  harga: number;
  tokoId: number;
  thumbnail: string;
  toko: Toko;
  kategoriId: number;
  kategori: Kategori;
  status: "tampilkan" | "sembunyikan";
  produkCabangs: {
    id: number;
    produkId: number;
    cabangId: number;
    cabang: Cabang;
    status: "tersedia" | "habis";
  }[];
  hashtags?: {
    id: number;
    produkId: number;
    hashtagId: number;
    hashtag: Hashtag;
  }[];
  username?: string;
  createdAt?: string;
};

export type ProdukUpdatePayload = {
  tokoId: number;
  nama_produk: string;
  deskripsi: string;
  harga: number;
  kategoriId: number;
  cabangData: { cabangId: number; status: "tersedia" | "habis" }[];
  hashtagIds?: number[];
  thumbnail: string;
  status: "tampilkan" | "sembunyikan";
};

export type ProdukCreatePayload = {
  tokoId: number;
  nama_produk: string;
  deskripsi: string;
  harga: number;
  kategoriId: number;
  cabangData: { cabangId: number; status: "tersedia" | "habis" }[];
  hashtagIds?: number[];
  thumbnail: string;
  status: "tampilkan" | "sembunyikan";
};

export interface PaginatedProdukResponse {
  data: Produk[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}

export interface ProdukResponse {
  data: Produk;
}
