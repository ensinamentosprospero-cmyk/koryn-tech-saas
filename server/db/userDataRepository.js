import {
  execute,
  isPostgres,
  parseJsonColumn,
  queryOne,
  sqlNow,
} from './dbClient.js';
import { normalizeUserData, normalizeUserEmail } from './userDataSchema.js';

export async function getUserData(tenantId, email) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) return normalizeUserData(null);

  const row = await queryOne('SELECT data_json FROM user_data WHERE tenant_id = ? AND email = ?', [
    tenantId,
    normalizedEmail,
  ]);

  if (!row) return normalizeUserData(null);

  return normalizeUserData(parseJsonColumn(row.data_json, null));
}

export async function saveUserData(tenantId, email, data) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) {
    return { error: 'E-mail inválido.' };
  }

  const normalized = normalizeUserData(data);
  const dataJson = JSON.stringify(normalized);
  const jsonCast = isPostgres() ? '?::jsonb' : '?';

  await execute(
    `INSERT INTO user_data (tenant_id, email, data_json, updated_at)
     VALUES (?, ?, ${jsonCast}, ${sqlNow()})
     ON CONFLICT(tenant_id, email) DO UPDATE SET
       data_json = excluded.data_json,
       updated_at = ${sqlNow()}`,
    [tenantId, normalizedEmail, dataJson]
  );

  return { data: normalized };
}

export async function deleteUserData(tenantId, email) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) return { error: 'E-mail inválido.' };

  await execute('DELETE FROM user_data WHERE tenant_id = ? AND email = ?', [
    tenantId,
    normalizedEmail,
  ]);

  return { ok: true };
}
