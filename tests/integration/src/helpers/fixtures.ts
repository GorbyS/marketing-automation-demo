import { ApiClient } from '@marketing/test-kit/src/http/apiClient';
import { CustomersClient } from '@marketing/test-kit/src/clients/customersClient';
import { ConsentsClient } from '@marketing/test-kit/src/clients/consentsClient';
import { EventsClient } from '@marketing/test-kit/src/clients/eventsClient';

function uniq(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function makeClients() {
  const api = new ApiClient();
  return {
    api,
    customers: new CustomersClient(api),
    consents: new ConsentsClient(api),
    events: new EventsClient(api),
  };
}

export async function createCustomer(params?: { externalId?: string; fullName?: string }) {
  const { customers } = makeClients();
  const externalId = params?.externalId ?? uniq('crm');
  const res = await customers.create({
    externalId,
    fullName: params?.fullName ?? 'Integration Test User',
    attributes: { segment: 'MORTGAGE_INTEREST' },
  });
  return { res, customerId: res.json.id, externalId };
}

export async function createCustomerWithConsent(marketingOptIn: boolean) {
  const { consents } = makeClients();
  const { customerId } = await createCustomer();
  const consentRes = await consents.upsert(customerId, { marketingOptIn });
  return { customerId, consentRes };
}

export async function createCustomerConsentAndMortgageEvent() {
  const { consents, events } = makeClients();
  const { customerId } = await createCustomer();

  await consents.upsert(customerId, { marketingOptIn: true });

  const idempotencyKey = `evt-${customerId}-view-mortgage-001`;
  const eventRes = await events.ingest({
    customerId,
    eventType: 'VIEW_MORTGAGE',
    idempotencyKey,
    payload: { page: '/mortgage' },
  });

  return { customerId, idempotencyKey, eventRes };
}
