import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// API'nin temel URL'sini tanımlıyoruz
const BASE_URL = "http://localhost:5170/api"; // API'nizin çalıştığı port'a göre değiştirin

// Axios instance'ını oluşturuyoruz
const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// İstek interceptor'ı - örneğin token eklemek için
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'ı - hata yönetimi için
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Yetkisiz erişim durumunda yapılacak işlemler
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// HTTP metodları için yardımcı fonksiyonlar
export const http = {
  get: <T,>(url: string, params?: any): Promise<T> => {
    return httpClient.get(url, { params }).then((response) => response.data);
  },

  post: <T,>(url: string, data?: any): Promise<T> => {
    return httpClient.post(url, data).then((response) => response.data);
  },

  put: <T,>(url: string, data?: any): Promise<T> => {
    return httpClient.put(url, data).then((response) => response.data);
  },

  delete: <T,>(url: string): Promise<T> => {
    return httpClient.delete(url).then((response) => response.data);
  },
};

export default http;
