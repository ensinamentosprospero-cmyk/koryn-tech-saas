import { getDatabase } from './database.js';
import { normalizeUserData, normalizeUserEmail } from './userDataSchema.js';

export function getUserData(tenantId, email, db = getDatabase()) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) return normalizeUserData(null);

  const row = db
    .prepare('SELECT data_json FROM user_data WHERE tenant_id = ? AND email = ?')
    .get(tenantId, normalizedEmail);

  if (!row) return normalizeUserData(null);

  try {
    return normalizeUserData(JSON.parse(row.data_json));
  } catch {
    return normalizeUserData(null);
  }
}

export function saveUserData(tenantId, email, data, db = getDatabase()) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) {
    return { error: 'E-mail inválido.' };
  }

  const normalized = normalizeUserData(data);

  db.prepare(
    `INSERT INTO user_data (tenant_id, email, data_json, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(tenant_id, email) DO UPDATE SET
       data_json = excluded.data_json,
       updated_at = datetime('now')`
  ).run(tenantId, normalizedEmail, JSON.stringify(normalized));

  return { data: normalized };
}

export function deleteUserData(tenantId, email, db = getDatabase()) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) return { error: 'E-mail inválido.' };

  db.prepare('DELETE FROM user_data WHERE tenant_id = ? AND email = ?').run(
    tenantId,
    normalizedEmail
  );

  return { ok: true };
}
