import { http } from "../lib/fetcher";
import type {
  PaginatedFaqResponse,
  FaqCreatePayload,
  FaqUpdatePayload,
  Faq,
} from "../models/faq";

export const faqService = {
  async index(params?: any) {
    return await http<PaginatedFaqResponse>("faq", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async landing(params?: any) {
    return await http<PaginatedFaqResponse>("faq/landing", {
      method: "GET",
      query: params,
      auth: false,
    });
  },

  async create(payload: FaqCreatePayload) {
    return await http<{ data: Faq }>("faq", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: Faq }>(`faq/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: FaqUpdatePayload) {
    return await http<{ data: Faq }>(`faq/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async delete(id: number) {
    return await http<{ data: Faq }>(`faq/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
