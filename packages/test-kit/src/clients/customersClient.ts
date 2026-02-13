import { ApiClient } from '../http/apiClient';

export type CustomerResponse = {
  id: string;
  externalId: string;
  fullName: string | null;
  attributes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export class CustomersClient {
  constructor(private readonly api: ApiClient) {}

  create(body: {
    externalId: string;
    fullName?: string | null;
    attributes?: Record<string, unknown>;
  }) {
    return this.api.post<CustomerResponse>('/v1/customers', body);
  }

  getById(id: string) {
    return this.api.get<CustomerResponse>(`/v1/customers/${id}`);
  }
}
