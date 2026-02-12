import { Router } from 'express';
import { createCustomerService, getCustomerByIdService } from '../services/customersService';

export const customersRoutes = Router();

customersRoutes.post('/v1/customers', async (req, res, next) => {
  try {
    const created = await createCustomerService({
      externalId: req.body?.externalId,
      fullName: req.body?.fullName ?? null,
      attributes: req.body?.attributes ?? {},
    });

    res.status(201).json({
      id: created.id,
      externalId: created.external_id,
      fullName: created.full_name,
      attributes: created.attributes,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    });
  } catch (e) {
    next(e);
  }
});

customersRoutes.get('/v1/customers/:id', async (req, res, next) => {
  try {
    const row = await getCustomerByIdService(req.params.id);

    res.status(200).json({
      id: row.id,
      externalId: row.external_id,
      fullName: row.full_name,
      attributes: row.attributes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (e) {
    next(e);
  }
});
