import { getCustomerById } from '../repos/customersRepo';
import { getConsent, hasEventType, insertOffer } from '../repos/offersRepo';
import { NotFoundError, ValidationError } from './customersService';

export async function getNextOfferService(customerId: string): Promise<{
  customerId: string;
  hasOffer: boolean;
  offer: null | { offerCode: string; decisionReason: string; createdAt: string };
  reason?: string;
}> {
  if (!customerId) throw new ValidationError('customerId is required');

  const customer = await getCustomerById(customerId);
  if (!customer) throw new NotFoundError('customer not found');

  const consent = await getConsent({ customerId });
  if (consent !== true) {
    return {
      customerId,
      hasOffer: false,
      offer: null,
      reason: 'NO_MARKETING_CONSENT',
    };
  }

  const interestedInMortgage = await hasEventType({ customerId, eventType: 'VIEW_MORTGAGE' });
  if (!interestedInMortgage) {
    return {
      customerId,
      hasOffer: false,
      offer: null,
      reason: 'NO_RELEVANT_EVENT',
    };
  }

  // Decision: offer is eligible
  const decisionReason = 'CONSENT_OK + VIEW_MORTGAGE';
  const created = await insertOffer({
    customerId,
    offerCode: 'MORTGAGE_PROMO_01',
    decisionReason,
  });

  return {
    customerId,
    hasOffer: true,
    offer: {
      offerCode: created.offer_code,
      decisionReason: created.decision_reason,
      createdAt: created.created_at,
    },
    reason: 'OFFER_ELIGIBLE',
  };
}
