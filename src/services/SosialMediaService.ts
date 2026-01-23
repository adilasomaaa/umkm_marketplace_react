import { http } from "../lib/fetcher";
import type {
  PaginatedSosialMediaResponse,
  SosialMediaCreatePayload,
  SosialMediaUpdatePayload,
  SosialMedia,
} from "../models/sosialmedia";

export const sosialMediaService = {
  async index(params?: any) {
    return await http<PaginatedSosialMediaResponse>("sosial-media", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async landing(params?: any) {
    return await http<PaginatedSosialMediaResponse>("sosial-media/landing", {
      method: "GET",
      query: params,
      auth: false,
    });
  },

  async create(payload: SosialMediaCreatePayload) {
    return await http<{ data: SosialMedia }>("sosial-media", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: SosialMedia }>(`sosial-media/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: SosialMediaUpdatePayload) {
    return await http<{ data: SosialMedia }>(`sosial-media/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async delete(id: number) {
    return await http<{ data: SosialMedia }>(`sosial-media/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
