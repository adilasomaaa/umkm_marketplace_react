export type Pendaftar = {
  id: number;
  nama_pemilik: string;
  nama_toko: string;
  nib: string;
  email: string;
  status: string;
  createdAt: string;
};

export type PendaftarUpdatePayload = {
  status: "menunggu" | "ditolak" | "diterima";
};

export type PendaftarCreatePayload = {
  nama_pemilik: string;
  nama_toko: string;
  nib: string;
  email: string;
};

export interface PaginatedPendaftarResponse {
  data: Pendaftar[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}
