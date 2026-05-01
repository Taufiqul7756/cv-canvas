export class ApiError extends Error {
  type: string;
  code: string;
  detail: string;
  attr?: string;
  status: number;

  constructor(status: number, type: string, code: string, detail: string, attr?: string) {
    super(detail);
    this.type = type;
    this.code = code;
    this.detail = detail;
    this.attr = attr;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(code: string, detail: string, attr?: string) {
    super(422, 'validation_error', code, detail, attr);
  }
}

export class AuthError extends ApiError {
  constructor(code: string, detail: string) {
    super(401, 'auth_error', code, detail);
  }
}

export class NotFoundError extends ApiError {
  constructor(detail = 'Not found.') {
    super(404, 'not_found', 'not_found', detail);
  }
}

export class ForbiddenError extends ApiError {
  constructor(detail = 'You do not have permission to perform this action.') {
    super(403, 'forbidden', 'forbidden', detail);
  }
}

export class QuotaExceededError extends ApiError {
  constructor(detail = 'Quota exceeded.') {
    super(429, 'quota_exceeded', 'quota_exceeded', detail);
  }
}

export class PaymentRequiredError extends ApiError {
  constructor(detail = 'Payment required to continue.') {
    super(402, 'payment_required', 'payment_required', detail);
  }
}
