import { Router } from 'express';
import { upsertConsentService } from '../services/consentsService';

export const consentsRoutes = Router();

consentsRoutes.put('/v1/consents/:customerId', async (req, res, next) => {
  try {
    const row = await upsertConsentService({
      customerId: req.params.customerId,
      marketingOptIn: req.body?.marketingOptIn,
    });

    res.status(200).json({
      customerId: row.customer_id,
      marketingOptIn: row.marketing_opt_in,
      updatedAt: row.updated_at,
    });
  } catch (e) {
    next(e);
  }
});
