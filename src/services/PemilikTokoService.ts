import { http } from "../lib/fetcher";
import type {
  PaginatedPemilikTokoResponse,
  PemilikTokoCreatePayload,
  PemilikTokoUpdatePayload,
  PemilikToko,
} from "../models/pemilik_toko";

// Asumsi nama file model mengikuti format [nama].model.ts

export const pemilikTokoService = {
  async index(params?: any) {
    return await http<PaginatedPemilikTokoResponse>("pemilik-toko", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async create(payload: PemilikTokoCreatePayload) {
    return await http<{ data: PemilikToko }>("pemilik-toko", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: PemilikToko }>(`pemilik-toko/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: PemilikTokoUpdatePayload) {
    return await http<{ data: PemilikToko }>(`pemilik-toko/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async delete(id: number) {
    return await http<{ data: PemilikToko }>(`pemilik-toko/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
