-- Enable UUID generation (pgcrypto provides gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Customers: marketing profile (simplified)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE,
  full_name TEXT NULL,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consents: marketing opt-in / preferences (simplified to one flag)
CREATE TABLE IF NOT EXISTS consents (
  customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events: event ingestion with idempotency
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_events_idempotency UNIQUE (idempotency_key)
);

-- Offers: decision record (next best offer)
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  offer_code TEXT NOT NULL,
  decision_reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes for typical queries
CREATE INDEX IF NOT EXISTS idx_events_customer_id_created_at
  ON events (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_offers_customer_id_created_at
  ON offers (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customers_updated_at
  ON customers (updated_at DESC);
