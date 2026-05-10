import axios from "axios";
import { create } from "zustand";

// ─── Axios instance ───────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ─── Decode JWT payload (không cần verify ở FE) ──────────
function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    // Kiểm tra token chưa hết hạn
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return decoded as {
      id: string;
      email: string;
      role: "admin" | "candidate";
    };
  } catch {
    return null;
  }
}

// ─── Auth Store (Zustand) ─────────────────────────────────
type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "candidate";
};

type AuthStore = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
};

// Khởi tạo user từ token có sẵn trong localStorage
function getInitialState(): { user: User | null; token: string | null } {
  const token = localStorage.getItem("token");
  if (!token) return { user: null, token: null };

  const decoded = decodeToken(token);
  if (!decoded) return { user: null, token: null };

  // Decode được payload nhưng không có name → dùng email tạm
  return {
    token,
    user: {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.email, // JWT không lưu name, dùng email tạm
    },
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...getInitialState(),

  login: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
