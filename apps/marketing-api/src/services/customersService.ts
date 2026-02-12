import { createCustomer, getCustomerById, CustomerRow } from '../repos/customersRepo';

export class ValidationError extends Error {
  status = 400 as const;
}

export class NotFoundError extends Error {
  status = 404 as const;
}

export class ConflictError extends Error {
  status = 409 as const;
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as any).code === '23505';
}

export async function createCustomerService(input: {
  externalId: string;
  fullName?: string | null;
  attributes?: unknown;
}): Promise<CustomerRow> {
  if (!input.externalId || input.externalId.trim().length < 3) {
    throw new ValidationError('externalId is required (min length 3)');
  }

  try {
    return await createCustomer(input);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError('customer with this externalId already exists');
    }
    throw err;
  }
}

export async function getCustomerByIdService(id: string): Promise<CustomerRow> {
  if (!id) throw new ValidationError('id is required');

  const row = await getCustomerById(id);
  if (!row) throw new NotFoundError('customer not found');
  return row;
}
