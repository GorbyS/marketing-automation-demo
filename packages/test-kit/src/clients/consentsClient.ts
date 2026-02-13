import { ApiClient } from '../http/apiClient';

export type ConsentResponse = {
  customerId: string;
  marketingOptIn: boolean;
  updatedAt: string;
};

export class ConsentsClient {
  constructor(private readonly api: ApiClient) {}

  upsert(customerId: string, body: { marketingOptIn: boolean }) {
    return this.api.put<ConsentResponse>(`/v1/consents/${customerId}`, body);
  }
}
