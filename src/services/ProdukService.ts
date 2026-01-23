import { http } from "../lib/fetcher";
import type {
  PaginatedProdukResponse,
  ProdukCreatePayload,
  ProdukUpdatePayload,
  Produk,
} from "../models/produk";

export const produkService = {
  async index(params?: any) {
    return await http<PaginatedProdukResponse>("produk", {
      method: "GET",
      query: params,
      auth: true,
    });
  },

  async landing(params?: any) {
    return await http<PaginatedProdukResponse>("produk/landing", {
      method: "GET",
      query: params,
      auth: false,
    });
  },

  async create(payload: ProdukCreatePayload) {
    const formData = new FormData();

    for (const key in payload) {
      const value = payload[key as keyof ProdukCreatePayload];

      if (value === null || value === undefined) {
        continue;
      }

      if (key === "thumbnail") {
        if ((value as any) instanceof FileList) {
          const fileList = value as unknown as FileList;
          const file = fileList.length > 0 ? fileList[0] : null;

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
    return await http<{ data: Produk }>("produk", {
      method: "POST",
      auth: true,
      body: formData,
    });
  },

  async show(id: number) {
    return await http<{ data: Produk }>(`produk/${id}`, {
      method: "GET",
      auth: true,
    });
  },

  async landingProduk(slug: string) {
    return await http<{ data: Produk }>(`produk/landing/${slug}`, {
      method: "GET",
      auth: false,
    });
  },

  async update(id: number, payload: ProdukUpdatePayload) {
    const formData = new FormData();

    for (const key in payload) {
      const value = payload[key as keyof ProdukCreatePayload];

      if (value === null || value === undefined) {
        continue;
      }

      if (key === "thumbnail") {
        if ((value as any) instanceof FileList) {
          const fileList = value as unknown as FileList;
          const file = fileList.length > 0 ? fileList[0] : null;

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
    return await http<{ data: Produk }>(`produk/${id}`, {
      method: "PATCH",
      auth: true,
      body: formData,
    });
  },

  async delete(id: number) {
    return await http<{ data: Produk }>(`produk/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
