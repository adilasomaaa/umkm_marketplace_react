import { http } from "../lib/fetcher";
import type {
  PaginatedCabangResponse,
  CabangCreatePayload,
  CabangUpdatePayload,
  Cabang,
} from "../models/cabang";


export const cabangService = {
  async index(params?: any) {
    return await http<PaginatedCabangResponse>("cabang-toko", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async create(payload: CabangCreatePayload) {
    return await http<{ data: Cabang }>("cabang-toko", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: Cabang }>(`cabang-toko/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: CabangUpdatePayload) {
    return await http<{ data: Cabang }>(`cabang-toko/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async delete(id: number) {
    return await http<{ data: Cabang }>(`cabang-toko/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
