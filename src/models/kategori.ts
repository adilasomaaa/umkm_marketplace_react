export type Kategori = {
  id: number;
  nama_kategori: string;
  tipe: "toko" | "produk";
  icon: string;
};

export type KategoriUpdatePayload = {
  nama_kategori: string;
  tipe: "toko" | "produk";
  icon: string;
};

export type KategoriCreatePayload = {
  nama_kategori: string;
  tipe: "toko" | "produk";
  icon: string;
};

export interface PaginatedKategoriResponse {
  data: Kategori[];
  meta?: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}

export interface KategoriResponse {
  data: Kategori[];
}

export interface KategoriShow {
  data: Kategori;
}
