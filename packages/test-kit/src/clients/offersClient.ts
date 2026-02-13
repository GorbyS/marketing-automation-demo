import { ApiClient } from '../http/apiClient';

export type NextOfferResponse = {
  customerId: string;
  hasOffer: boolean;
  offer: null | { offerCode: string; decisionReason: string; createdAt: string };
  reason?: string;
};

export class OffersClient {
  constructor(private readonly api: ApiClient) {}

  next(customerId: string) {
    return this.api.get<NextOfferResponse>(
      `/v1/offers/next?customerId=${encodeURIComponent(customerId)}`,
    );
  }
}
