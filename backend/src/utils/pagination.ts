interface PaginationInput<T> {
  count: number;
  page: number;
  page_size: number;
  basePath: string;
  queryParams: Record<string, string>;
  results: T[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const buildPaginatedResponse = <T>({
  count,
  page,
  page_size,
  basePath,
  queryParams,
  results,
}: PaginationInput<T>): PaginatedResponse<T> => {
  const buildUrl = (p: number): string => {
    const params = new URLSearchParams({
      ...queryParams,
      page: String(p),
      page_size: String(page_size),
    });
    return `${basePath}?${params.toString()}`;
  };

  const totalPages = Math.ceil(count / page_size);

  return {
    count,
    next: page < totalPages ? buildUrl(page + 1) : null,
    previous: page > 1 ? buildUrl(page - 1) : null,
    results,
  };
};
