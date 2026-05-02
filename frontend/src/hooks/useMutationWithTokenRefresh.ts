import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';
import { post } from '@/lib/api/authHandlers';
import { ApiError } from '@/types/Types';

export function useMutationWithTokenRefresh<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>,
): UseMutationResult<TData, ApiError, TVariables> {
  const wrappedFn = async (variables: TVariables): Promise<TData> => {
    try {
      return await mutationFn(variables);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        try {
          await post<unknown>('/auth/refresh', {});
          return await mutationFn(variables);
        } catch {
          throw err;
        }
      }
      throw err;
    }
  };

  return useMutation<TData, ApiError, TVariables>({
    ...options,
    mutationFn: wrappedFn,
  });
}
