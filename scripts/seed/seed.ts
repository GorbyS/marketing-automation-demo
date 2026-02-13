import { ApiClient } from '@marketing/test-kit/src/http/apiClient';
import { CustomersClient } from '@marketing/test-kit/src/clients/customersClient';
import { ConsentsClient } from '@marketing/test-kit/src/clients/consentsClient';
import { EventsClient } from '@marketing/test-kit/src/clients/eventsClient';
import { OffersClient } from '@marketing/test-kit/src/clients/offersClient';
import { truncateAll } from '@marketing/test-kit/src/db/cleanup';

type SeedCustomer = {
  label: string;
  customerId: string;
  externalId: string;
  consent: boolean;
  hasMortgageEvent: boolean;
  offerResult?: { hasOffer: boolean; reason?: string; offerCode?: string };
};

function uniq(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function main() {
  const api = new ApiClient();
  const customers = new CustomersClient(api);
  const consents = new ConsentsClient(api);
  const events = new EventsClient(api);
  const offers = new OffersClient(api);

  if (process.env.SEED_TRUNCATE === 'true') {
    await truncateAll();
  }

  const created: SeedCustomer[] = [];

  {
    const externalId = uniq('seed-crm-A');
    const c = await customers.create({
      externalId,
      fullName: 'Seed Customer A (no consent)',
      attributes: { segment: 'GENERIC' },
    });
    const customerId = c.json.id;

    const next = await offers.next(customerId);

    created.push({
      label: 'A: no consent',
      customerId,
      externalId,
      consent: false,
      hasMortgageEvent: false,
      offerResult: {
        hasOffer: next.json.hasOffer,
        reason: next.json.reason,
        offerCode: next.json.offer?.offerCode,
      },
    });
  }

  {
    const externalId = uniq('seed-crm-B');
    const c = await customers.create({
      externalId,
      fullName: 'Seed Customer B (consent, no event)',
      attributes: { segment: 'UNKNOWN_INTENT' },
    });
    const customerId = c.json.id;

    await consents.upsert(customerId, { marketingOptIn: true });

    const next = await offers.next(customerId);

    created.push({
      label: 'B: consent true, no event',
      customerId,
      externalId,
      consent: true,
      hasMortgageEvent: false,
      offerResult: {
        hasOffer: next.json.hasOffer,
        reason: next.json.reason,
        offerCode: next.json.offer?.offerCode,
      },
    });
  }

  {
    const externalId = uniq('seed-crm-C');
    const c = await customers.create({
      externalId,
      fullName: 'Seed Customer C (eligible for mortgage offer)',
      attributes: { segment: 'MORTGAGE_INTEREST' },
    });
    const customerId = c.json.id;

    await consents.upsert(customerId, { marketingOptIn: true });

    const idemKey = `seed-evt-${customerId}-view-mortgage-001`;
    await events.ingest({
      customerId,
      eventType: 'VIEW_MORTGAGE',
      idempotencyKey: idemKey,
      payload: { page: '/mortgage', source: 'seed' },
    });

    const next = await offers.next(customerId);

    created.push({
      label: 'C: consent true + mortgage event',
      customerId,
      externalId,
      consent: true,
      hasMortgageEvent: true,
      offerResult: {
        hasOffer: next.json.hasOffer,
        reason: next.json.reason,
        offerCode: next.json.offer?.offerCode,
      },
    });
  }

  {
    const externalId = uniq('seed-crm-D');
    const c = await customers.create({
      externalId,
      fullName: 'Seed Customer D (multiple events)',
      attributes: { segment: 'MORTGAGE_INTEREST' },
    });
    const customerId = c.json.id;

    await consents.upsert(customerId, { marketingOptIn: true });

    await events.ingest({
      customerId,
      eventType: 'LOGIN',
      idempotencyKey: `seed-evt-${customerId}-login-001`,
      payload: { channel: 'web', source: 'seed' },
    });

    await events.ingest({
      customerId,
      eventType: 'VIEW_MORTGAGE',
      idempotencyKey: `seed-evt-${customerId}-view-mortgage-001`,
      payload: { page: '/mortgage', source: 'seed' },
    });

    await events.ingest({
      customerId,
      eventType: 'CALC_MORTGAGE',
      idempotencyKey: `seed-evt-${customerId}-calc-mortgage-001`,
      payload: { amount: 3000000, currency: 'CZK', source: 'seed' },
    });

    const next = await offers.next(customerId);

    created.push({
      label: 'D: consent true + multiple events',
      customerId,
      externalId,
      consent: true,
      hasMortgageEvent: true,
      offerResult: {
        hasOffer: next.json.hasOffer,
        reason: next.json.reason,
        offerCode: next.json.offer?.offerCode,
      },
    });
  }

  console.log('\nSeed complete. Customers created:\n');
  for (const x of created) {
    console.log(
      [
        x.label,
        `customerId=${x.customerId}`,
        `externalId=${x.externalId}`,
        `consent=${x.consent}`,
        `mortgageEvent=${x.hasMortgageEvent}`,
        `hasOffer=${x.offerResult?.hasOffer}`,
        `reason=${x.offerResult?.reason ?? '-'}`,
        `offerCode=${x.offerResult?.offerCode ?? '-'}`,
      ].join(' | '),
    );
  }

  console.log('\nTip: use these customerIds in Postman / pgAdmin queries.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
