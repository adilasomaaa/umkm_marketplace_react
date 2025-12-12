export type Cabang = {
  id: number;
  nama_cabang: string;
  tipe: string;
  alamat: string;
  latitude?: number;
  longitude?: number;
  status: "aktif" | "nonaktif";
  createdAt?: string;
};

export type CabangUpdatePayload = {
  tokoId: number;
  nama_cabang: string;
  tipe: string;
  alamat: string;
  latitude?: number;
  longitude?: number;
  status: "aktif" | "nonaktif";
};

export type CabangCreatePayload = {
  tokoId: number;
  nama_cabang: string;
  tipe: string;
  alamat: string;
  latitude?: number;
  longitude?: number;
  status: "aktif" | "nonaktif";
};

export interface PaginatedCabangResponse {
  data: Cabang[];
  meta: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}
