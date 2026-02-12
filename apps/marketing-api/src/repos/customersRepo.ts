import { pool } from '../db/pool';

export type CustomerRow = {
  id: string;
  external_id: string;
  full_name: string | null;
  attributes: unknown;
  created_at: string;
  updated_at: string;
};

export async function createCustomer(params: {
  externalId: string;
  fullName?: string | null;
  attributes?: unknown;
}): Promise<CustomerRow> {
  const { externalId, fullName = null, attributes = {} } = params;

  const result = await pool.query<CustomerRow>(
    `
    INSERT INTO customers (external_id, full_name, attributes)
    VALUES ($1, $2, $3::jsonb)
    RETURNING id, external_id, full_name, attributes, created_at, updated_at
    `,
    [externalId, fullName, JSON.stringify(attributes)],
  );

  return result.rows[0];
}

export async function getCustomerById(id: string): Promise<CustomerRow | null> {
  const result = await pool.query<CustomerRow>(
    `
    SELECT id, external_id, full_name, attributes, created_at, updated_at
    FROM customers
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}
