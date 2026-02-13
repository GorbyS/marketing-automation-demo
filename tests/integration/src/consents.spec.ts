import { expect } from 'chai';
import { beforeEachHook, afterAllHook } from './helpers/setup';
import { makeClients, createCustomer } from './helpers/fixtures';

describe('Consents', () => {
  const { consents } = makeClients();

  beforeEach(async () => beforeEachHook());
  after(async () => afterAllHook());

  it('upserts consent (200)', async () => {
    const { customerId } = await createCustomer();
    const res = await consents.upsert(customerId, { marketingOptIn: true });

    expect(res.status).to.equal(200);
    expect(res.json.customerId).to.equal(customerId);
    expect(res.json.marketingOptIn).to.equal(true);
  });

  it('returns 404 when customer does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await consents.upsert(fakeId, { marketingOptIn: true });

    expect(res.status).to.equal(404);
    expect((res.json as any).error?.message).to.be.a('string');
  });

  it('returns 400 when marketingOptIn is not boolean', async () => {
    const { customerId } = await createCustomer();
    const res = await consents.upsert(customerId, { marketingOptIn: 'true' as any });

    expect(res.status).to.equal(400);
    expect((res.json as any).error?.message).to.be.a('string');
  });
});
