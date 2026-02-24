import { expect } from 'chai';
import { beforeEachHook, afterAllHook } from './helpers/setup';
import { makeClients } from './helpers/fixtures';
import { isSuccessResponse, isErrorResponse } from '@marketing/test-kit/src/http/typeGuards';

describe('Customers', () => {
  const { customers } = makeClients();

  beforeEach(async () => beforeEachHook());
  after(async () => afterAllHook());

  it('creates customer (201)', async () => {
    const res = await customers.create({
      externalId: `crm-${Date.now()}`,
      fullName: 'Customer 1',
      attributes: { segment: 'MORTGAGE_INTEREST' },
    });

    expect(res.status).to.equal(201);
    if (isSuccessResponse(res)) {
      expect(res.json).to.have.property('id');
      expect(res.json.externalId).to.be.a('string');
    }
  });

  it('returns 409 on duplicate externalId', async () => {
    const externalId = `crm-dup-${Date.now()}`;

    const existingClient = await customers.create({ externalId });
    expect(existingClient.status).to.equal(201);

    const duplicatedClient = await customers.create({ externalId });
    expect(duplicatedClient.status).to.equal(409);
    if (isErrorResponse(duplicatedClient)) {
      expect(duplicatedClient.json.error?.message).to.be.a('string');
    }
  });

  it('returns 400 when externalId is missing', async () => {
    const res = await customers.create({ externalId: '' as any });
    expect(res.status).to.equal(400);
    if (isErrorResponse(res)) {
      expect(res.json.error?.message).to.be.a('string');
    }
  });
});
