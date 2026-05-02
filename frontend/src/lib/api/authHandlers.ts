import axios from 'axios';
import { API_URL } from '@/types/Config';
import { ApiError, ApiErrorBody } from '@/types/Types';

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      const status = error.response?.status ?? 500;
      const data = error.response?.data;
      if (data && typeof data === 'object' && 'type' in data) {
        throw new ApiError(data as ApiErrorBody, status);
      }
      throw new ApiError(
        {
          type: 'server_error',
          errors: [{ code: 'server_error', detail: error.message }],
        },
        status,
      );
    }
    throw new ApiError(
      { type: 'server_error', errors: [{ code: 'server_error', detail: 'Unknown error' }] },
      500,
    );
  },
);

export const get = async <T>(url: string): Promise<T> => {
  const { data } = await instance.get<T>(url);
  return data;
};

export const post = async <T>(url: string, body: unknown): Promise<T> => {
  const { data } = await instance.post<T>(url, body);
  return data;
};

export const put = async <T>(url: string, body: unknown): Promise<T> => {
  const { data } = await instance.put<T>(url, body);
  return data;
};

export const patch = async <T>(url: string, body: unknown): Promise<T> => {
  const { data } = await instance.patch<T>(url, body);
  return data;
};

export const del = async (url: string): Promise<void> => {
  await instance.delete(url);
};

export const delMany = async (url: string, body: unknown): Promise<void> => {
  await instance.delete(url, { data: body });
};
