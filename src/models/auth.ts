import type { Toko } from "./toko";

export type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  verifiedAt: string;
  avatarUrl?: string | null;
  toko?: Toko | null;
  roles: {
    name: "admin" | "client" | string; // bisa tambah role lain
    rolePermissions: string[]; // contoh: ["create_post", ...]
  };
};

export type AuthResponse = {
  status: boolean;
  token: string; // kalau JWT
};

export type RegisterPayload = {
  email: string;
  name: string;
  nama_toko: string;
  nib: string;
  password: string;
};

export type VerificationCode = {
  email: string;
  code: string;
};

export type ResendCode = {
  email: string;
};
