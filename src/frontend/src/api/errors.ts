export type ApiErrorKind = 'business' | 'validation' | 'unauthorized' | 'forbidden' | 'notFound' | 'unknown';

interface ApiErrorParams {
  status: number;
  kind: ApiErrorKind;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Normaliza los 4 formatos de error documentados en docs/api-spec-frontend.md (sección 4):
 * regla de negocio ({message}), ValidationProblemDetails ({errors}) por campo faltante,
 * 401/403 sin body, y 404 ProblemDetails.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly fieldErrors?: Record<string, string[]>;

  constructor({ status, kind, message, fieldErrors }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.fieldErrors = fieldErrors;
  }
}
