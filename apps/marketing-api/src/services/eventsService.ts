import { getCustomerById } from '../repos/customersRepo';
import { getEventByIdempotencyKey, insertEvent, EventRow } from '../repos/eventsRepo';
import { NotFoundError, ValidationError, ConflictError } from './customersService';

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as any).code === '23505';
}

export async function ingestEventService(input: {
  customerId: string;
  eventType: string;
  idempotencyKey: string;
  payload?: unknown;
}): Promise<{ row: EventRow; isDuplicate: boolean; status: 200 | 201 }> {
  if (!input.customerId) throw new ValidationError('customerId is required');
  if (!input.eventType || input.eventType.trim().length < 2)
    throw new ValidationError('eventType is required');
  if (!input.idempotencyKey || input.idempotencyKey.trim().length < 8) {
    throw new ValidationError('idempotencyKey is required (min length 8)');
  }

  const customer = await getCustomerById(input.customerId);
  if (!customer) throw new NotFoundError('customer not found');

  // Fast path: already exists
  const existing = await getEventByIdempotencyKey(input.idempotencyKey);
  if (existing) return { row: existing, isDuplicate: true, status: 200 };

  try {
    const created = await insertEvent(input);
    return { row: created, isDuplicate: false, status: 201 };
  } catch (err) {
    // Race condition protection: if two requests insert same idempotencyKey concurrently
    if (isUniqueViolation(err)) {
      const again = await getEventByIdempotencyKey(input.idempotencyKey);
      if (again) return { row: again, isDuplicate: true, status: 200 };
      throw new ConflictError('duplicate idempotencyKey');
    }
    throw err;
  }
}
