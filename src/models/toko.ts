import type { Kategori } from "./kategori";

export type Toko = {
  id: number;
  nama_toko: string;
  nib: string;
  rating?: string;
  slug: string;
  deskripsi?: string;
  nomor_hp?: string;
  logo?: string;
  status: "aktif" | "nonaktif" | "ditangguhkan";
  PemilikToko: {
    id: number;
    nama: string;
    jabatan?: string;
    status: "aktif" | "non-aktif";
    user: {
      id: number;
      email: string;
      username: string;
    };
  }[];
  KategoriToko?: {
    id: number;
    tokoId: number;
    kategoriId: number;
    kategori: Kategori;
  }[];
  CabangToko: {
    id: number;
    alamat: string;
    latitude: string;
    longitude: string;
    nama_cabang: string;
    tipe: string;
    status: string;
  }[];
  createdAt?: string;
};

export type TokoUpdatePayload = {
  nama_toko: string;
  nib: string;
  status: "aktif" | "nonaktif" | "ditangguhkan";
};

export type TokoClient = {
  id: number;
  nama_toko: string;
  nib: string;
  rating?: string;
  slug: string;
  logo?: string;
  deskripsi?: string;
  nomor_hp?: string;
  KategoriToko: {
    id: number;
    tokoId: number;
    kategoriId: number;
    kategori: Kategori;
  }[];
  CabangToko: {
    id: number;
    alamat: string;
    latitude: string;
    longitude: string;
    nama_cabang: string;
    tipe: string;
    status: string;
  }[];
  PemilikToko: {
    id: number;
    nama: string;
    jabatan?: string;
    status: "aktif" | "non-aktif";
    user: {
      id: number;
      email: string;
      username: string;
    };
  }[];
  createdAt?: string;
};

export type TokoUpdateClientPayload = {
  deskripsi?: string;
  nama_toko?: string;
  nib?: string;
  nomor_hp?: string;
  logo?: string;
  kategori_id?: number[];
};

export type TokoCreatePayload = {
  nama_pemilik: string;
  nama_toko: string;
  nib: string;
  email: string;
  status: "aktif" | "nonaktif" | "ditangguhkan";
};

export interface PaginatedTokoResponse {
  data: Toko[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}
