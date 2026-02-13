import { truncateAll } from '@marketing/test-kit/src/db/cleanup';
import { closeDb } from '@marketing/test-kit/src/db/dbClient';

export async function beforeEachHook() {
  await truncateAll();
}

export async function afterAllHook() {
  await closeDb();
}
