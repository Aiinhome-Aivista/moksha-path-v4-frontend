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
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_CATEGORIES,
    method: "GET",
  });

/** Admin Login */
export const blogAdminLogin = (data: { username?: string; password?: string }) =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_ADMIN_LOGIN,
    method: "POST",
    data,
  });

/** Admin Dashboard */
export const getAdminDashboard = () =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_ADMIN_DASHBOARD,
    method: "GET",
  });

/** Admin Blogs List */
export const getAdminBlogs = (params?: any) =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOGS_LIST,
    method: "GET",
    params,
  });

/** Category Insert/Update */
export const insertUpdateBlogCategory = (data: any) =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_CATEGORY_INSERT_UPDATE,
    method: "POST",
    data,
  });

/** Category Delete */
export const deleteBlogCategory = (data: { id: string | number }) =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_CATEGORY_DELETE,
    method: "POST",
    data,
  });

/** Blog Insert/Update */
export const insertUpdateBlog = (data: any) =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_INSERT_UPDATE,
    method: "POST",
    data,
    // Note: If using FormData, let apiClient handle Content-Type or pass it here
  });

/** Blog Delete */
export const deleteBlog = (data: { id: string | number }) =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_DELETE,
    method: "POST",
    data,
  });

/** SEO Settings Insert/Update */
export const insertUpdateBlogSeo = (data: any) =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_SEO_INSERT_UPDATE,
    method: "POST",
    data,
  });

/** SEO Settings Delete */
export const deleteBlogSeo = (data: { id: string | number }) =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_SEO_DELETE,
    method: "POST",
    data,
  });

/** Blog Category Dropdown */
export const getBlogCategoryDropdown = () =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_CATEGORY_DROPDOWN,
    method: "GET",
  });

/** Blog Author Dropdown */
export const getBlogAuthorDropdown = () =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_AUTHOR_DROPDOWN,
    method: "GET",
  });

/** Blog SEO Settings */
export const getBlogSeoSettings = () =>
  apiRequest<any>({
    url: API_ENDPOINTS.BLOG_SEO_SETTINGS,
    method: "GET",
  });
