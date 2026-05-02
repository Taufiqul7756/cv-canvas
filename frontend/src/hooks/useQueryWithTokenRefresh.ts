import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
} from '@tanstack/react-query';
import { post } from '@/lib/api/authHandlers';
import { ApiError } from '@/types/Types';

export function useQueryWithTokenRefresh<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'>,
): UseQueryResult<TData, ApiError> {
  const wrappedFn = async (): Promise<TData> => {
    try {
      return await queryFn();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        try {
          await post<unknown>('/auth/refresh', {});
          return await queryFn();
        } catch {
          throw err;
        }
      }
      throw err;
    }
  };

  return useQuery<TData, ApiError>({
    ...options,
    queryKey,
    queryFn: wrappedFn,
    retry: false,
  });
}
