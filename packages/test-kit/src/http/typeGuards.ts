import type { ApiResponse } from './apiClient';
import type { ApiErrorBody } from './errorTypes';

export function isSuccessResponse<T>(res: ApiResponse<T | ApiErrorBody>): res is ApiResponse<T> {
  return res.status === 200;
}

export function isErrorResponse<T>(
  res: ApiResponse<T | ApiErrorBody>,
): res is ApiResponse<ApiErrorBody> {
  return res.status !== 200;
}
