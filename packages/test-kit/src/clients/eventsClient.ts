import { ApiClient } from '../http/apiClient';

export type IngestEventResponse = {
  id: string;
  customerId: string;
  eventType: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  createdAt: string;
  isDuplicate: boolean;
};

export class EventsClient {
  constructor(private readonly api: ApiClient) {}

  ingest(body: {
    customerId: string;
    eventType: string;
    idempotencyKey: string;
    payload?: Record<string, unknown>;
  }) {
    return this.api.post<IngestEventResponse>('/v1/events', body);
  }
}
