import { AppError } from '../types/types';

const API_ERROR_ACCESS_DENIED = 15;

const errorMessages: Record<number, string> = {
  [API_ERROR_ACCESS_DENIED]: 'Ошибка доступа',
};

export function getErrorText(error?: AppError) {
  let errorText;
  if (typeof error === 'string') {
    errorText = error;
  } else if (error && 'error_text' in error) {
    errorText = error.error_text;
  } else if (error && 'error_code' in error && errorMessages[error.error_code]) {
    errorText = errorMessages[error.error_code];
  } else {
    errorText = 'Произошла неизвестная ошибка';
  }

  return errorText;
}
