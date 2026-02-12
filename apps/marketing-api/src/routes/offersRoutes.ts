import { Router } from 'express';
import { getNextOfferService } from '../services/offersService';

export const offersRoutes = Router();

offersRoutes.get('/v1/offers/next', async (req, res, next) => {
  try {
    const customerId = String(req.query.customerId ?? '');
    const result = await getNextOfferService(customerId);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
});
