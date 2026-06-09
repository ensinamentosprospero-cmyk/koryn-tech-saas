import http from 'node:http';
import {
  bootstrapTenantStore,
  createTenant,
  isKnownTenant,
  listTenants,
  readTenantConfig,
  updateTenant,
  writeTenantConfig,
} from './tenantStore.js';
import {
  getSubscriptionPlan,
  getTenantSubscription,
  isTenantSubscriptionActive,
  listSubscriptionPlans,
  listTenantsWithSubscriptions,
  updateTenantSubscription,
} from './db/subscriptionRepository.js';
import {
  createCheckoutSession,
  getBillingProviderName,
  handleBillingWebhook,
} from './billing/billingProvider.js';
import {
  ROLES,
  canAccessUserData,
  canManageTenant,
  getUserFromRequest,
  hasRole,
  loginUser,
  registerUser,
} from './auth/authService.js';
import { getUserData, saveUserData as saveUserDataRecord } from './db/userDataRepository.js';
import { env, getDatabaseDriver, getPublicConfig, validateProductionEnv } from './config/env.js';
import { canServeStatic, getDistDir, serveStatic } from './staticServer.js';

validateProductionEnv();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': env.corsOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
  });
  response.end(JSON.stringify(payload));
}

async function readRawBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return '';

  return Buffer.concat(chunks).toString('utf8');
}

async function readJsonBody(request) {
  const raw = await readRawBody(request);
  if (!raw) return null;

  return JSON.parse(raw);
}

function requireAuth(request, response, allowedRoles) {
  const user = getUserFromRequest(request);

  if (!user) {
    sendJson(response, 401, { error: 'Autenticação necessária.' });
    return null;
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    sendJson(response, 403, { error: 'Permissão insuficiente.' });
    return null;
  }

  return user;
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (url.pathname === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, {
        ok: true,
        ...getPublicConfig(),
      });
      return;
    }

    if (url.pathname === '/api/billing/plans' && request.method === 'GET') {
      sendJson(response, 200, {
        provider: getBillingProviderName(),
        plans: listSubscriptionPlans(),
      });
      return;
    }

    if (url.pathname === '/api/billing/checkout' && request.method === 'POST') {
      const user = requireAuth(request, response, [ROLES.TENANT_OWNER, ROLES.PLATFORM_ADMIN]);
      if (!user) return;

      const body = await readJsonBody(request);
      const tenantId = body?.tenantId || user.tenantId;
      const planId = body?.planId || 'starter';

      if (!canManageTenant(user, tenantId)) {
        sendJson(response, 403, { error: 'Sem permissão para assinar esta loja.' });
        return;
      }

      const plan = getSubscriptionPlan(planId);
      if (!plan) {
        sendJson(response, 400, { error: 'Plano não encontrado.' });
        return;
      }

      const checkout = await createCheckoutSession({
        tenantId,
        planId,
        plan,
        successUrl: body?.successUrl,
        cancelUrl: body?.cancelUrl,
      });

      if (checkout.error) {
        sendJson(response, 400, { error: checkout.error });
        return;
      }

      sendJson(response, 200, checkout);
      return;
    }

    if (url.pathname === '/api/billing/webhook/stripe' && request.method === 'POST') {
      const rawBody = await readRawBody(request);
      const result = await handleBillingWebhook(rawBody, request.headers['stripe-signature']);

      if (result.error) {
        sendJson(response, 400, { error: result.error });
        return;
      }

      sendJson(response, 200, result);
      return;
    }

    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const result = loginUser({
        email: body?.email,
        password: body?.password,
        tenantId: body?.tenantId,
        scope: body?.scope,
      });

      if (result.error) {
        sendJson(response, 401, { error: result.error });
        return;
      }

      sendJson(response, 200, result);
      return;
    }

    if (url.pathname === '/api/auth/register' && request.method === 'POST') {
      const body = await readJsonBody(request);
      const result = registerUser({
        email: body?.email,
        password: body?.password,
        tenantId: body?.tenantId,
      });

      if (result.error) {
        sendJson(response, 400, { error: result.error });
        return;
      }

      sendJson(response, 201, result);
      return;
    }

    if (url.pathname === '/api/auth/me' && request.method === 'GET') {
      const user = requireAuth(request, response);
      if (!user) return;

      sendJson(response, 200, { user });
      return;
    }

    if (url.pathname === '/api/tenants') {
      if (request.method === 'GET') {
        const includeInactive = url.searchParams.get('all') === '1';

        if (includeInactive) {
          const user = requireAuth(request, response, [ROLES.PLATFORM_ADMIN]);
          if (!user) return;
        }

        const tenants = includeInactive ? listTenantsWithSubscriptions() : listTenants();
        sendJson(response, 200, { tenants });
        return;
      }

      if (request.method === 'POST') {
        const user = requireAuth(request, response, [ROLES.PLATFORM_ADMIN]);
        if (!user) return;

        const body = await readJsonBody(request);
        const result = createTenant({
          id: body?.id,
          name: body?.name,
        });

        if (result.error) {
          sendJson(response, 400, { error: result.error });
          return;
        }

        sendJson(response, 201, { tenant: result.tenant });
        return;
      }
    }

    const tenantMatch = url.pathname.match(/^\/api\/tenants\/([^/]+)$/);
    if (tenantMatch && request.method === 'PATCH') {
      const user = requireAuth(request, response, [ROLES.PLATFORM_ADMIN]);
      if (!user) return;

      const tenantId = decodeURIComponent(tenantMatch[1]);
      const body = await readJsonBody(request);
      const result = updateTenant(tenantId, {
        name: body?.name,
        active: body?.active,
      });

      if (result.error) {
        const statusCode = result.error === 'Tenant não encontrado.' ? 404 : 400;
        sendJson(response, statusCode, { error: result.error });
        return;
      }

      sendJson(response, 200, { tenant: result.tenant });
      return;
    }

    const subscriptionMatch = url.pathname.match(/^\/api\/tenants\/([^/]+)\/subscription$/);
    if (subscriptionMatch) {
      const tenantId = decodeURIComponent(subscriptionMatch[1]);

      if (request.method === 'GET') {
        const user = getUserFromRequest(request);
        if (!canManageTenant(user, tenantId) && !hasRole(user, [ROLES.PLATFORM_ADMIN])) {
          sendJson(response, 401, { error: 'Autenticação necessária.' });
          return;
        }

        const subscription = getTenantSubscription(tenantId);
        sendJson(response, 200, {
          tenantId,
          subscription,
          subscriptionActive: isTenantSubscriptionActive(tenantId),
        });
        return;
      }

      if (request.method === 'PATCH') {
        const user = requireAuth(request, response, [ROLES.PLATFORM_ADMIN]);
        if (!user) return;

        const body = await readJsonBody(request);
        const result = updateTenantSubscription(tenantId, {
          planId: body?.planId,
          status: body?.status,
          provider: body?.provider,
          currentPeriodEnd: body?.currentPeriodEnd,
          trialEndsAt: body?.trialEndsAt,
        });

        if (result.error) {
          sendJson(response, 400, { error: result.error });
          return;
        }

        sendJson(response, 200, {
          tenantId,
          subscription: result.subscription,
          subscriptionActive: isTenantSubscriptionActive(tenantId),
        });
        return;
      }
    }

    const userDataMatch = url.pathname.match(/^\/api\/tenants\/([^/]+)\/user-data$/);
    if (userDataMatch) {
      const tenantId = decodeURIComponent(userDataMatch[1]);
      const user = getUserFromRequest(request);

      if (!canAccessUserData(user, tenantId)) {
        sendJson(response, 401, { error: 'Autenticação necessária.' });
        return;
      }

      if (request.method === 'GET') {
        const data = getUserData(tenantId, user.email);
        sendJson(response, 200, { tenantId, email: user.email, data });
        return;
      }

      if (request.method === 'PUT') {
        const body = await readJsonBody(request);
        const payload = body?.data ?? body;
        const result = saveUserDataRecord(tenantId, user.email, payload);

        if (result.error) {
          sendJson(response, 400, { error: result.error });
          return;
        }

        sendJson(response, 200, {
          tenantId,
          email: user.email,
          data: result.data,
        });
        return;
      }
    }

    const configMatch = url.pathname.match(/^\/api\/tenants\/([^/]+)\/config$/);
    if (configMatch) {
      const tenantId = decodeURIComponent(configMatch[1]);

      if (!isTenantSubscriptionActive(tenantId)) {
        sendJson(response, 403, {
          error: 'Assinatura inativa. A loja está temporariamente indisponível.',
          code: 'SUBSCRIPTION_INACTIVE',
          tenantId,
          subscription: getTenantSubscription(tenantId),
        });
        return;
      }

      const tenants = listTenants();

      if (!isKnownTenant(tenantId, tenants)) {
        sendJson(response, 404, { error: 'Tenant não encontrado.' });
        return;
      }

      if (request.method === 'GET') {
        const config = readTenantConfig(tenantId);
        if (!config) {
          sendJson(response, 404, { error: 'Configuração não encontrada.' });
          return;
        }

        sendJson(response, 200, { tenantId, config });
        return;
      }

      if (request.method === 'PUT') {
        const user = getUserFromRequest(request);
        if (!canManageTenant(user, tenantId)) {
          sendJson(response, 401, { error: 'Autenticação necessária para salvar configuração.' });
          return;
        }

        const body = await readJsonBody(request);
        const config = body?.config ?? body;

        if (!config || typeof config !== 'object') {
          sendJson(response, 400, { error: 'Payload inválido.' });
          return;
        }

        const saved = writeTenantConfig(tenantId, config);
        sendJson(response, 200, { tenantId, config: saved });
        return;
      }
    }

    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      serveStatic(url.pathname, response, request.method)
    ) {
      return;
    }

    sendJson(response, 404, { error: 'Rota não encontrada.' });
  } catch (error) {
    console.error('Erro na API:', error);
    sendJson(response, 500, { error: 'Erro interno da API.' });
  }
});

await bootstrapTenantStore();

server.listen(env.port, () => {
  console.log(`Koryn Tech SaaS rodando em http://localhost:${env.port}`);
  console.log(`Ambiente: ${env.nodeEnv}`);
  console.log(`Banco runtime: ${getDatabaseDriver()} (${env.storeDbPath})`);

  if (canServeStatic()) {
    console.log(`Frontend estático: ${getDistDir()}`);
  } else if (env.serveStatic) {
    console.warn('SERVE_STATIC ativo, mas pasta dist/ não encontrada. Execute: npm run build');
  }
});
