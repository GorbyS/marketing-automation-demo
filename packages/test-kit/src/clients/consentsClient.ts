import { ApiClient } from '../http/apiClient';
import type { ApiErrorBody } from '../http/errorTypes';

export type ConsentResponse = {
  customerId: string;
  marketingOptIn: boolean;
  updatedAt: string;
};

export type ApiResponse<T> =
  | { status: 200 | 201; json: T }
  | { status: 400 | 404 | 409 | 500; json: ApiErrorBody };

export class ConsentsClient {
  constructor(private readonly api: ApiClient) {}

  upsert(customerId: string, body: { marketingOptIn: boolean }) {
    return this.api.put<ConsentResponse | ApiErrorBody>(`/v1/consents/${customerId}`, body);
  }
}
