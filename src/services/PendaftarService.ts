import { http } from "../lib/fetcher";
import type {
  PaginatedPendaftarResponse,
  PendaftarCreatePayload,
  PendaftarUpdatePayload,
  Pendaftar,
} from "../models/pendaftar";

export const pendaftarService = {
  async index(params?: any) {
    return await http<PaginatedPendaftarResponse>("pendaftar", {
      // pendaftars untuk endpoint jamak
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async create(payload: PendaftarCreatePayload) {
    return await http<{ data: Pendaftar }>("pendaftar", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: Pendaftar }>(`pendaftar/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: PendaftarUpdatePayload) {
    return await http<{ data: Pendaftar }>(`pendaftar/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async delete(id: number) {
    return await http<{ data: Pendaftar }>(`pendaftar/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
