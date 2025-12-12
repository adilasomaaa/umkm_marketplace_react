import { http } from "../lib/fetcher";
import type {
  PaginatedKategoriResponse,
  KategoriCreatePayload,
  KategoriUpdatePayload,
  Kategori,
} from "../models/kategori";

export const kategoriService = {
  async index(params?: any) {
    return await http<PaginatedKategoriResponse>("kategori", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async create(payload: KategoriCreatePayload) {
    return await http<{ data: Kategori }>("kategori", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: Kategori }>(`kategori/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: KategoriUpdatePayload) {
    return await http<{ data: Kategori }>(`kategori/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async delete(id: number) {
    return await http<{ data: Kategori }>(`kategori/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
