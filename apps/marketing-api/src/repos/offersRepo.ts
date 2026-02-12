import { pool } from '../db/pool';

export type OfferRow = {
  id: string;
  customer_id: string;
  offer_code: string;
  decision_reason: string;
  created_at: string;
};

export async function insertOffer(params: {
  customerId: string;
  offerCode: string;
  decisionReason: string;
}): Promise<OfferRow> {
  const result = await pool.query<OfferRow>(
    `
    INSERT INTO offers (customer_id, offer_code, decision_reason)
    VALUES ($1, $2, $3)
    RETURNING id, customer_id, offer_code, decision_reason, created_at
    `,
    [params.customerId, params.offerCode, params.decisionReason],
  );

  return result.rows[0];
}

export async function hasEventType(params: {
  customerId: string;
  eventType: string;
}): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1
      FROM events
      WHERE customer_id = $1 AND event_type = $2
      LIMIT 1
    ) as "exists"
    `,
    [params.customerId, params.eventType],
  );

  return Boolean(result.rows[0]?.exists);
}

export async function getConsent(params: { customerId: string }): Promise<boolean | null> {
  const result = await pool.query<{ marketing_opt_in: boolean }>(
    `
    SELECT marketing_opt_in
    FROM consents
    WHERE customer_id = $1
    `,
    [params.customerId],
  );

  return result.rows[0]?.marketing_opt_in ?? null;
}
