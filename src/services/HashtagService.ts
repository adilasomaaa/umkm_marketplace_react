import { http } from "../lib/fetcher";
import type {
  PaginatedHashtagResponse,
  Hashtag,
} from "../models/hashtag";

export const hashtagService = {
  async index(params?: any) {
    return await http<PaginatedHashtagResponse>("hashtag", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async create(payload: { tokoId: number; nama: string }) {
    return await http<{ data: Hashtag }>("hashtag", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: Hashtag }>(`hashtag/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: { tokoId?: number; nama: string }) {
    return await http<{ data: Hashtag }>(`hashtag/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async delete(id: number) {
    return await http<{ data: any }>(`hashtag/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
