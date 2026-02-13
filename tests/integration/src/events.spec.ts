import { expect } from 'chai';
import { beforeEachHook, afterAllHook } from './helpers/setup';
import { makeClients, createCustomer } from './helpers/fixtures';
import { queryOne } from '@marketing/test-kit/src/db/dbClient';

describe('Events', () => {
  const { events } = makeClients();

  beforeEach(async () => beforeEachHook());
  after(async () => afterAllHook());

  it('is idempotent by idempotencyKey (201 then 200, same id/createdAt)', async () => {
    const { customerId } = await createCustomer();
    const key = `evt-${customerId}-view-mortgage-001`;

    const e1 = await events.ingest({
      customerId,
      eventType: 'VIEW_MORTGAGE',
      idempotencyKey: key,
      payload: { page: '/mortgage' },
    });

    expect(e1.status).to.equal(201);
    expect(e1.json.isDuplicate).to.equal(false);

    const e2 = await events.ingest({
      customerId,
      eventType: 'VIEW_MORTGAGE',
      idempotencyKey: key,
      payload: { page: '/mortgage' },
    });

    expect(e2.status).to.equal(200);
    expect(e2.json.isDuplicate).to.equal(true);
    expect(e2.json.id).to.equal(e1.json.id);
    expect(e2.json.createdAt).to.equal(e1.json.createdAt);

    const row = await queryOne<{ cnt: string }>(
      `SELECT count(*)::text as cnt FROM events WHERE idempotency_key = $1`,
      [key],
    );
    expect(row?.cnt).to.equal('1');
  });

  it('returns 404 when customer does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await events.ingest({
      customerId: fakeId,
      eventType: 'VIEW_MORTGAGE',
      idempotencyKey: 'evt-nonexistent-0001',
      payload: {},
    });

    expect(res.status).to.equal(404);
    expect((res.json as any).error?.message).to.be.a('string');
  });

  it('returns 400 when idempotencyKey is too short', async () => {
    const { customerId } = await createCustomer();
    const res = await events.ingest({
      customerId,
      eventType: 'VIEW_MORTGAGE',
      idempotencyKey: 'short',
      payload: {},
    });

    expect(res.status).to.equal(400);
    expect((res.json as any).error?.message).to.be.a('string');
  });
});
