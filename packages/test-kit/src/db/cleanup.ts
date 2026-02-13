import { exec } from './dbClient';
import { getDatabaseUrl } from '../config/config';

function assertTestDb() {
  const url = getDatabaseUrl();

  // Простая защита: требуем, чтобы имя базы оканчивалось на _test
  // или чтобы был явный флаг, что вы в demo режиме.
  const allow = process.env.ALLOW_DB_TRUNCATE === 'true';
  const looksLikeTest = /\/[^/]*_test(\?|$)/.test(url);

  if (!allow && !looksLikeTest) {
    throw new Error(
      `Refusing to TRUNCATE. Set ALLOW_DB_TRUNCATE=true or use a *_test database. Current DATABASE_URL="${url}"`,
    );
  }
}

export async function truncateAll(): Promise<void> {
  assertTestDb();

  await exec(`
    TRUNCATE TABLE
      offers,
      events,
      consents,
      customers
    CASCADE;
  `);
}
