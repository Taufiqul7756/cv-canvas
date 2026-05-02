export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'CV Canvas';

export const FREE_DOWNLOAD_LIMIT = Number(
  process.env.NEXT_PUBLIC_FREE_DOWNLOAD_LIMIT ?? 3,
);
