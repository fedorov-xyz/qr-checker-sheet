export type ValueOf<T> = T[keyof T];

interface BaseAPIError {
  error_code: number;
  error_text?: string;
}

export type AppError = string | BaseAPIError | Error;
