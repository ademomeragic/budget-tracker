export interface CategoryResponse {
  id: number;
  name: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
}
