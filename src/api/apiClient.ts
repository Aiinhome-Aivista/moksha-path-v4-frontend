import axios, { type AxiosRequestConfig, AxiosError } from "axios";

// Base instance
const api = axios.create({
  baseURL: import.meta.env.VITE_MOKSH_PATH_BASE_URL,
  timeout: 10000,
});

// 🔥 Request Interceptor (Dynamic Headers)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set default Content-Type if not already specified and not FormData
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 Response Interceptor (Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let message = "Something went wrong";

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 400:
          message = "Bad Request";
          break;
        case 401:
          message = "Unauthorized - Please login again";
          break;
        case 403:
          message = "Forbidden";
          break;
        case 404:
          message = "Not Found";
          break;
        case 500:
          message = "Server Error";
          break;
      }
    } else if (error.request) {
      message = "No response from server";
    }

    console.error("API Error:", message);

    return Promise.reject({
      message,
      originalError: error,
    });
  }
);

// 🔥 Generic Request Function
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  const response = await api(config);
  return response.data;
};

export default api;