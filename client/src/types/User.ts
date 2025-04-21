// src/types/User.ts
export interface UserResponse {
  id: number;
  name?: string;
  email?: string;
}

export interface CreateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  id: number;
}

export interface UpdateUserRequest {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}
