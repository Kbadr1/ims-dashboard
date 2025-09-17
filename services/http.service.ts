  
import { useAuthStore } from "@/auth.store";
import axios from "axios";

export const httpClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Authorization": "",
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (config.headers) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove header entirely when no token to avoid sending empty string
      delete (config.headers as Record<string, unknown>)["Authorization"];
    }
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);