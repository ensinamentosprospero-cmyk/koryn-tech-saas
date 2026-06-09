import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

const TOKEN_TTL_SECONDS = Number(process.env.JWT_TTL_SECONDS || 60 * 60 * 24 * 7);

function encodeBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function decodeBase64Url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signSegment(segment) {
  return createHmac('sha256', env.jwtSecret).update(segment).digest('base64url');
}

export function createAccessToken(payload) {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Url(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    })
  );
  const signature = signSegment(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

export function verifyAccessToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = signSegment(`${header}.${body}`);

  try {
    if (
      expectedSignature.length !== signature.length ||
      !timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
    ) {
      return null;
    }
  } catch {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(decodeBase64Url(body));
  } catch {
    return null;
  }

  if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
