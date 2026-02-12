import { Router } from 'express';
import { ingestEventService } from '../services/eventsService';

export const eventsRoutes = Router();

eventsRoutes.post('/v1/events', async (req, res, next) => {
  try {
    const result = await ingestEventService({
      customerId: req.body?.customerId,
      eventType: req.body?.eventType,
      idempotencyKey: req.body?.idempotencyKey,
      payload: req.body?.payload ?? {},
    });

    const row = result.row;

    res.status(result.status).json({
      id: row.id,
      customerId: row.customer_id,
      eventType: row.event_type,
      idempotencyKey: row.idempotency_key,
      payload: row.payload,
      createdAt: row.created_at,
      isDuplicate: result.isDuplicate,
    });
  } catch (e) {
    next(e);
  }
});
