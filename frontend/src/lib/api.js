import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({ baseURL: VITE_API_URL ||"http://localhost:3000/api" });

const getStoredToken = () => {
  const rawAuth = localStorage.getItem("auth-storage");
  if (!rawAuth) return null;

  try {
    const parsed = JSON.parse(rawAuth);
    if (!parsed) return null;
    if (typeof parsed === "string") return parsed;
    if (parsed.token) return parsed.token;
    if (parsed.state?.token) return parsed.state.token;
    return null;
  } catch (error) {
    console.warn("⚠️ Failed to parse persisted auth token:", error.message);
    return null;
  }
};

api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token || getStoredToken();

  config.headers = {
    ...(config.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  

  if (!token) {
    console.warn("⚠️ NO TOKEN FOUND - Request will be unauthenticated!");
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  },
);

export default api;
