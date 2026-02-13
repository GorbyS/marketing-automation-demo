Marketing Automation Demo (Mocha + TypeScript + Express + Postgres)

This project demonstrates production-like backend API automation for a Personalized Marketing / CRM system.

It includes:

Express REST API
PostgreSQL (Docker)
Contract-first OpenAPI (Swagger)
Integration tests (Mocha + TypeScript)
JUnit & HTML reports
Seed script for demo data
Database-level assertions
Idempotency testing

Architecture Overview

apps/marketing-api → Express backend
packages/test-kit → reusable API client + DB helpers
tests/integration → Mocha integration tests
openapi/ → OpenAPI contract
scripts/seed → demo data generator

Requirements

Node.js 18+
Docker
npm

Setup
Install dependencies: npm install
Start PostgreSQL: docker compose up -d
Run migrations: npm run db:migrate
Start API: npm run dev
Swagger UI: Swagger UI: http://localhost:3000/docs

Seed Demo Data: npm run seed
Run Integration Tests: npm run test:integration

Reports will be generated in: tests/integration/reports/
