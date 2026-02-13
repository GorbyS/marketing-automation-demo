import { expect } from 'chai';
import { beforeEachHook, afterAllHook } from './helpers/setup';
import {
  makeClients,
  createCustomer,
  createCustomerWithConsent,
  createCustomerConsentAndMortgageEvent,
} from './helpers/fixtures';
import { queryOne } from '@marketing/test-kit/src/db/dbClient';
import { OffersClient } from '@marketing/test-kit/src/clients/offersClient';

describe('Offers (Next Best Offer)', () => {
  const { api } = makeClients();
  const offers = new OffersClient(api);

  beforeEach(async () => beforeEachHook());
  after(async () => afterAllHook());

  it('returns NO_MARKETING_CONSENT and does not insert into offers', async () => {
    const { customerId } = await createCustomer();
    const next = await offers.next(customerId);

    expect(next.status).to.equal(200);
    expect(next.json.hasOffer).to.equal(false);
    expect(next.json.reason).to.equal('NO_MARKETING_CONSENT');

    const row = await queryOne<{ cnt: string }>(
      `SELECT count(*)::text as cnt FROM offers WHERE customer_id = $1`,
      [customerId],
    );
    expect(row?.cnt).to.equal('0');
  });

  it('returns NO_RELEVANT_EVENT when consent true but no event', async () => {
    const { customerId } = await createCustomerWithConsent(true);
    const next = await offers.next(customerId);

    expect(next.status).to.equal(200);
    expect(next.json.hasOffer).to.equal(false);
    expect(next.json.reason).to.equal('NO_RELEVANT_EVENT');
  });

  it('returns offer and inserts decision record when eligible', async () => {
    const { customerId } = await createCustomerConsentAndMortgageEvent();

    const next = await offers.next(customerId);
    expect(next.status).to.equal(200);
    expect(next.json.hasOffer).to.equal(true);
    expect(next.json.offer?.offerCode).to.equal('MORTGAGE_PROMO_01');

    const offerRow = await queryOne<{ offer_code: string }>(
      `SELECT offer_code FROM offers WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [customerId],
    );
    expect(offerRow?.offer_code).to.equal('MORTGAGE_PROMO_01');
  });
});
