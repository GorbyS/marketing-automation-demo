import { pool } from '../db/pool';

export type EventRow = {
  id: string;
  customer_id: string;
  event_type: string;
  payload: unknown;
  idempotency_key: string;
  created_at: string;
};

export async function getEventByIdempotencyKey(idempotencyKey: string): Promise<EventRow | null> {
  const result = await pool.query<EventRow>(
    `
    SELECT id, customer_id, event_type, payload, idempotency_key, created_at
    FROM events
    WHERE idempotency_key = $1
    `,
    [idempotencyKey],
  );
  return result.rows[0] ?? null;
}

export async function insertEvent(params: {
  customerId: string;
  eventType: string;
  payload?: unknown;
  idempotencyKey: string;
}): Promise<EventRow> {
  const { customerId, eventType, payload = {}, idempotencyKey } = params;

  const result = await pool.query<EventRow>(
    `
    INSERT INTO events (customer_id, event_type, payload, idempotency_key)
    VALUES ($1, $2, $3::jsonb, $4)
    RETURNING id, customer_id, event_type, payload, idempotency_key, created_at
    `,
    [customerId, eventType, JSON.stringify(payload), idempotencyKey],
  );

  return result.rows[0];
}
