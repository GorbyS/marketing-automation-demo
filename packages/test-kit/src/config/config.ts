export function getBaseUrl(): string {
  const v = process.env.API_BASE_URL ?? 'http://localhost:3000';
  return v.replace(/\/+$/, '');
}

export function getDatabaseUrl(): string {
  const v = process.env.DATABASE_URL;
  if (!v) throw new Error('DATABASE_URL is required for DB assertions');
  return v;
}
