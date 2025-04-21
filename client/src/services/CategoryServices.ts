// src/services/CategoryService.ts
import axiosInstance from "../axios";
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/Category";

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const response = await axiosInstance.get("/Category");
  return response.data;
};

export const getCategory = async (id: number): Promise<CategoryResponse> => {
  const response = await axiosInstance.get(`/Category/${id}`);
  return response.data;
};

export const createCategory = async (
  category: CreateCategoryRequest
): Promise<CategoryResponse> => {
  const response = await axiosInstance.post("/Category", category);
  return response.data;
};

export const updateCategory = async (
  category: UpdateCategoryRequest
): Promise<CategoryResponse> => {
  const response = await axiosInstance.put(
    `/categories/${category.id}`,
    category
  );
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/Category/${id}`);
};
