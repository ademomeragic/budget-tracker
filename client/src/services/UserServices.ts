// src/services/UserService.ts
import axiosInstance from "../axios";
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/User";

export const getUser = async (id: number): Promise<UserResponse> => {
  const response = await axiosInstance.get(`/User/${id}`);
  return response.data;
};

export const createUser = async (
  user: CreateUserRequest
): Promise<UserResponse> => {
  const response = await axiosInstance.post("/User", user);
  return response.data;
};

export const updateUser = async (
  user: UpdateUserRequest
): Promise<UserResponse> => {
  const response = await axiosInstance.put(`/User/${user.id}`, user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/User/${id}`);
};
