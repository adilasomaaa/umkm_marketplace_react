import { http } from "../lib/fetcher";
import type {
  PaginatedTokoResponse,
  TokoCreatePayload,
  TokoUpdatePayload,
  Toko,
  TokoClient,
  TokoUpdateClientPayload,
} from "../models/toko";

export const tokoService = {
  async index(params?: any) {
    return await http<PaginatedTokoResponse>("toko", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async create(payload: TokoCreatePayload) {
    return await http<{ data: Toko }>("toko", {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async show(id: number) {
    return await http<{ data: Toko }>(`toko/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async client(id: number) {
    return await http<{ data: TokoClient }>(`toko/${id}/client`, {
      method: "GET",
      auth: true,
    });
  },

  async update(id: number, payload: TokoUpdatePayload) {
    return await http<{ data: Toko }>(`toko/${id}`, {
      method: "PATCH",
      auth: true,
      body: payload,
    });
  },

  async updateClient(id: number, payload: TokoUpdateClientPayload) {
    const formData = new FormData();

    for (const key in payload) {
      const value = payload[key as keyof TokoUpdateClientPayload];

      if (value === null || value === undefined) {
        continue;
      }

      if (key === "logo") {
        if (value instanceof FileList) {
          const file = value.length > 0 ? value[0] : null;

          if (file) {
            formData.append(key, file);
          } else {
            formData.append(key, "");
          }
        } else {
          formData.append(key, String(value));
        }
      } else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, String(item)));
      } else {
        formData.append(key, String(value));
      }
    }
    return await http<{ data: Toko }>(`toko/${id}/client`, {
      body: formData,
      contentType: "formData",
      method: "PATCH",
      auth: true,
    });
  },

  async delete(id: number) {
    return await http<{ data: Toko }>(`toko/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
