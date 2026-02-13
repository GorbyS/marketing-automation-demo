import { expect } from 'chai';
import { beforeEachHook, afterAllHook } from './helpers/setup';
import { makeClients } from './helpers/fixtures';

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
    expect(res.json).to.have.property('id');
    expect(res.json.externalId).to.be.a('string');
  });

  it('returns 409 on duplicate externalId', async () => {
    const externalId = `crm-dup-${Date.now()}`;

    const a = await customers.create({ externalId });
    expect(a.status).to.equal(201);

    const b = await customers.create({ externalId });
    expect(b.status).to.equal(409);
    expect((b.json as any).error?.message).to.be.a('string');
  });

  it('returns 400 when externalId is missing', async () => {
    const res = await customers.create({ externalId: '' as any });
    expect(res.status).to.equal(400);
    expect((res.json as any).error?.message).to.be.a('string');
  });
});
