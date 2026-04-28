import { apiRequest } from "../api/apiClient";
import { API_ENDPOINTS } from "../api/endpoints";

export interface Blog {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  category?: string;
  thumbnail?: string;
  published_at?: string;
  created_at?: string;
}

export interface BlogsResponse {
  blogs?: Blog[];
  total?: number;
  page?: number;
  [key: string]: any; // To support response?.data?.code indexing
}

/** Fetch all public blogs (optionally filter by category, page, etc.) */
export const getPublicBlogs = (params?: {
  category?: string;
  page?: number;
  limit?: number;
}) =>
  apiRequest<BlogsResponse>({
    url: API_ENDPOINTS.PUBLIC_BLOGS,
    method: "GET",
    params,
  });

/** Fetch blog categories */
export const getBlogCategories = () =>
  apiRequest<{ categories: { id: string; name: string }[] }>({
    url: API_ENDPOINTS.BLOG_CATEGORIES,
    method: "GET",
  });
