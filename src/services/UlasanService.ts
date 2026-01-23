import { http } from "../lib/fetcher";
import type {
  PaginatedUlasanResponse,
  Ulasan,
  UlasanCreatePayload,
  UlasanUpdatePayload,
} from "../models/ulasan";

export const ulasanService = {
  async index(params?: any) {
    return await http<PaginatedUlasanResponse>("ulasan", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async landing(params?: any) {
    return await http<PaginatedUlasanResponse>("ulasan/landing", {
      method: "GET",
      query: params,
      auth: false,
    });
  },

  async create(payload: UlasanCreatePayload) {
    return await http<{ data: Ulasan }>("ulasan", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: Ulasan }>(`ulasan/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: UlasanUpdatePayload) {
    return await http<{ data: Ulasan }>(`ulasan/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async delete(id: number) {
    return await http<{ data: Ulasan }>(`ulasan/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
