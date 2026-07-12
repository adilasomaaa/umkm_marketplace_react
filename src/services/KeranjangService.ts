import { http } from "../lib/fetcher";

const getCartHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("x-cart-token");
  return token ? { "x-cart-token": token } : {};
};

export const keranjangService = {
  async add(payload: { tokoId: number; produkId: number; quantiti: number }) {
    const res = await http<{ message: string; tokenSession: string; data: any }>("keranjang", {
      method: "POST",
      headers: getCartHeaders(),
      body: payload,
      auth: false,
    });
    if (res.tokenSession) {
      localStorage.setItem("x-cart-token", res.tokenSession);
    }
    return res;
  },

  async index() {
    const token = localStorage.getItem("x-cart-token");
    if (!token) return [];
    return await http<any[]>("keranjang", {
      method: "GET",
      headers: getCartHeaders(),
      auth: false,
    });
  },

  async update(id: number, payload: { quantiti: number }) {
    return await http<any>(`keranjang/${id}`, {
      method: "PATCH",
      headers: getCartHeaders(),
      body: payload,
      auth: false,
    });
  },

  async delete(id: number) {
    return await http<any>(`keranjang/${id}`, {
      method: "DELETE",
      headers: getCartHeaders(),
      auth: false,
    });
  }
};
