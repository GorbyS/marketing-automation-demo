import { upsertConsent, ConsentRow } from '../repos/consentsRepo';
import { getCustomerById } from '../repos/customersRepo';
import { NotFoundError, ValidationError } from './customersService';

export async function upsertConsentService(input: {
  customerId: string;
  marketingOptIn: boolean;
}): Promise<ConsentRow> {
  if (!input.customerId) throw new ValidationError('customerId is required');
  if (typeof input.marketingOptIn !== 'boolean') {
    throw new ValidationError('marketingOptIn must be boolean');
  }

  const customer = await getCustomerById(input.customerId);
  if (!customer) throw new NotFoundError('customer not found');

  return upsertConsent(input);
}
