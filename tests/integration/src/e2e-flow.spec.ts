import { expect } from 'chai';
import { beforeEachHook, afterAllHook } from './helpers/setup';
import { makeClients } from './helpers/fixtures';
import { OffersClient } from '@marketing/test-kit/src/clients/offersClient';
import { queryOne } from '@marketing/test-kit/src/db/dbClient';

describe('E2E flow', () => {
  const { api, customers, consents, events } = makeClients();
  const offers = new OffersClient(api);

  beforeEach(async () => beforeEachHook());
  after(async () => afterAllHook());

  it('customer -> consent -> idempotent event -> next offer', async () => {
    const externalId = `crm-${Date.now()}`;

    const created = await customers.create({
      externalId,
      fullName: 'E2E User',
      attributes: { segment: 'MORTGAGE_INTEREST' },
    });

    expect(created.status).to.equal(201);
    const customerId = created.json.id;

    const consentRes = await consents.upsert(customerId, { marketingOptIn: true });
    expect(consentRes.status).to.equal(200);

    const idemKey = `evt-${customerId}-view-mortgage-001`;

    const e1 = await events.ingest({
      customerId,
      eventType: 'VIEW_MORTGAGE',
      idempotencyKey: idemKey,
      payload: { page: '/mortgage' },
    });
    expect(e1.status).to.equal(201);

    const e2 = await events.ingest({
      customerId,
      eventType: 'VIEW_MORTGAGE',
      idempotencyKey: idemKey,
      payload: { page: '/mortgage' },
    });
    expect(e2.status).to.equal(200);
    expect(e2.json.id).to.equal(e1.json.id);

    const cnt = await queryOne<{ cnt: string }>(
      `SELECT count(*)::text as cnt FROM events WHERE idempotency_key = $1`,
      [idemKey],
    );
    expect(cnt?.cnt).to.equal('1');

    const next = await offers.next(customerId);
    expect(next.status).to.equal(200);
    expect(next.json.hasOffer).to.equal(true);
    expect(next.json.offer?.offerCode).to.equal('MORTGAGE_PROMO_01');
  });
});
