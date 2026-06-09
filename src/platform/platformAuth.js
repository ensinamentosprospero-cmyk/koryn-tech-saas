import {
  clearPlatformAuthToken,
  readPlatformAuthToken,
  writePlatformAuthToken,
} from '../utils/authTokenStorage.js';
import { loginWithApi } from '../api/authApi.js';

const PLATFORM_SESSION_KEY = 'koryn-tech-platform-session';

export function isPlatformAuthenticated() {
  return Boolean(readPlatformAuthToken()) || sessionStorage.getItem(PLATFORM_SESSION_KEY) === '1';
}

export async function loginPlatform(email, password) {
  try {
    const result = await loginWithApi({
      email,
      password,
      scope: 'platform',
    });

    writePlatformAuthToken(result.token);
    sessionStorage.setItem(PLATFORM_SESSION_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

export function logoutPlatform() {
  clearPlatformAuthToken();
  sessionStorage.removeItem(PLATFORM_SESSION_KEY);
}
