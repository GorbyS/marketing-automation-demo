import { pool } from '../db/pool';

export type ConsentRow = {
  customer_id: string;
  marketing_opt_in: boolean;
  updated_at: string;
};

export async function upsertConsent(params: {
  customerId: string;
  marketingOptIn: boolean;
}): Promise<ConsentRow> {
  const result = await pool.query<ConsentRow>(
    `
    INSERT INTO consents (customer_id, marketing_opt_in, updated_at)
    VALUES ($1, $2, now())
    ON CONFLICT (customer_id)
    DO UPDATE SET marketing_opt_in = EXCLUDED.marketing_opt_in,
                  updated_at = now()
    RETURNING customer_id, marketing_opt_in, updated_at
    `,
    [params.customerId, params.marketingOptIn],
  );

  return result.rows[0];
}
