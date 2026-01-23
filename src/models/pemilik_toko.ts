export type PemilikToko = {
  id: number;
  nama: string;
  jabatan: string;
  userId: number;
  tokoId: number;
  user: {
    email: string;
    photo: string;
    username: string;
    createdAt: string;
  };
  toko: {
    id: number;
    nib: string;
    nama_toko: string;
    slug: string;
    deskripsi: string;
    nomor_hp: string;
    logo: string;
    rating: string;
    createdAt: string;
  };
  status: "aktif" | "nonaktif";
  createdAt: string;
};

export type PemilikTokoUpdatePayload = {
  nama: string;
  jabatan: string;
  photo?: string;
  status: string;
  email: string;
  tokoId?: number;
};

export type PemilikTokoCreatePayload = {
  nama: string;
  tokoId: number;
  email: string;
  jabatan?: string;
};

export interface PaginatedPemilikTokoResponse {
  data: PemilikToko[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}
