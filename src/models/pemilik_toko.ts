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
  photo: string;
  status: string;
  email: string;
};

export type PemilikTokoCreatePayload = {
  nama_pemilik: string;
  toko_id: number;
  email: string;
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
