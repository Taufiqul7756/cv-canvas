export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorDetail {
  code: string;
  detail: string;
  attr?: string;
}

export interface ApiErrorBody {
  type: string;
  errors: ApiErrorDetail[];
}

export class ApiError extends Error {
  type: string;
  errors: ApiErrorDetail[];
  status: number;

  constructor(body: ApiErrorBody, status: number) {
    super(body.errors[0]?.detail ?? 'An error occurred');
    this.type = body.type;
    this.errors = body.errors;
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
