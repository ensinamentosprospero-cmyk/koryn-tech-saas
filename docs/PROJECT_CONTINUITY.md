# Continuidade do Projeto — Koryn Tech SaaS Multi-tenant

> **OBRIGATÓRIO PARA TODO NOVO AGENT:** leia este arquivo inteiro antes de alterar qualquer coisa.
> Ao concluir uma etapa, **atualize este documento** com o que foi feito e qual é o próximo passo exato.

---

## Visão geral

Sistema SaaS multi-tenant para lojistas de eletrônicos personalizarem sua loja online.

- **Frontend:** React 19 + Vite 6 + Tailwind (`src/`)
- **API local:** Node HTTP (`server/`) porta **3001**
- **Frontend dev:** porta **5173** (proxy `/api` → 3001)
- **Pasta do projeto:** `cell-prime-store`

---

## Regras que NUNCA devem ser quebradas

1. **Não alterar layout do site público** sem pedido explícito
2. **Não remover funcionalidades** existentes
3. **Não apagar `localStorage` do cliente** (cache legado do tenant `default`)
4. **Não refazer o projeto do zero**
5. **Assinatura/cobrança** implementada na FASE 3.5 — novas lojas exigem plano ativo (exceto tenant `default`)
6. **Supabase/Postgres:** schema pronto (`schema.postgres.sql`); runtime da API ainda usa SQLite até migração completa dos repositórios

---

## Status das fases

| Fase | Status | Descrição |
|------|--------|-----------|
| **FASE 1** | ✅ Concluída | Camada `loadStoreConfig` / `saveStoreConfig` com localStorage |
| **FASE 2** | ✅ Concluída | Multi-tenant: URL `?loja=`, API JSON, cache local, dados isolados por tenant |
| **FASE 3.1** | ✅ Concluída | Banco SQLite no servidor (substitui JSON como fonte primária) |
| **FASE 3.2** | ✅ Concluída | Painel da plataforma (`/platform`) + criar/desativar lojas |
| **FASE 3.3** | ✅ Concluída | Auth server-side (JWT, papéis, rotas protegidas) |
| **FASE 3.4** | ✅ Concluída | Subdomínio por loja (`demo.localhost`, etc.) |
| **FASE 3.5** | ✅ Concluída | Assinatura/cobrança (SQLite + manual/Stripe) |
| **FASE 3.6** | ✅ Concluída | Sync carrinho/favoritos/pedidos na API |
| **FASE 4** | ✅ Concluída | Produção: servidor unificado, env, health, schema Postgres |

---

## Próximo passo exato (para o próximo agent)

**GitHub + Railway em produção** — deploy ativo.

| Item | Valor |
|------|-------|
| **GitHub** | https://github.com/ensinamentosprospero-cmyk/koryn-tech-saas |
| **Railway projeto** | `koryn-tech-saas` |
| **URL pública** | https://web-production-b5f0a.up.railway.app |
| **Health** | https://web-production-b5f0a.up.railway.app/api/health |
| **Conta Railway** | conceicaorodney56@gmail.com |
| **Volume SQLite** | `/app/server/data` → `web-volume` |

Variáveis já configuradas: `NODE_ENV`, `SERVE_STATIC`, `JWT_SECRET`, `APP_BASE_URL`, `VITE_TENANT_BASE_DOMAINS`, `STORE_DB_PATH`, `BILLING_PROVIDER=manual`.

**Próximos passos opcionais:**
1. Domínio custom + DNS wildcard (`*.seudominio.com`) no Railway
2. Stripe live (`BILLING_PROVIDER=stripe` + chaves)
3. **Supabase runtime** — migrar repositórios de SQLite para Postgres
4. Nginx/Caddy na VPS com HTTPS (alternativa ao Railway)
5. **Não** alterar layout da loja pública

---

## Arquitetura de dados

### Tenant (loja)

- Resolvido em `src/tenant/resolveTenant.js` + `src/tenant/resolveTenantFromHost.js`
- **Prioridade:** `?loja=` / `?tenant=` → subdomínio → `sessionStorage` → `default`
- Subdomínio dev: `http://demo.localhost:5173` (funciona sem editar hosts no Windows)
- Plataforma: `/platform` ou `http://platform.localhost:5173`
- Default: `default` (loja Koryn Tech original — `localhost:5173` ou domínio raiz)
- Variável opcional: `VITE_TENANT_BASE_DOMAINS=localhost,seudominio.com` (`.env`)
- Subdomínios reservados: `www`, `platform`, `api`, `admin`, `app`

### Config da loja (frontend)

| Camada | Arquivo |
|--------|---------|
| Repositório | `src/data/storeConfigRepository.js` |
| Cache local | `src/data/localStoreConfigAdapter.js` |
| API remota | `src/data/remoteStoreConfigAdapter.js` |
| Schema/normalize | `src/data/storeConfigSchema.js` |
| Contexto React | `src/context/SiteConfigContext.jsx` |

Fluxo: **API → cache localStorage → defaults**

### Config da loja (backend) — FASE 3.1

| Camada | Arquivo |
|--------|---------|
| SQLite | `server/data/store.db` |
| Conexão/schema | `server/db/database.js` |
| Repositório | `server/db/tenantRepository.js` |
| Migração JSON→DB | `server/db/migrateFromJson.js` |
| Facade API | `server/tenantStore.js` |

### Dados por usuário

| Dado | Onde | Observação |
|------|------|------------|
| Sessão auth (legado) | `src/utils/authStorage.js` | Flags por tenant no localStorage |
| JWT auth (FASE 3.3) | `src/utils/authTokenStorage.js` | Token por tenant; plataforma em sessionStorage |
| Tema | `src/utils/themeStorage.js` | por tenant + email |
| Carrinho/favoritos/pedidos (cache) | `src/utils/userDataStorage.js` | localStorage por tenant + email |
| Repositório user data (FASE 3.6) | `src/data/userDataRepository.js` | API + fallback local |
| API user data | `src/api/userDataApi.js` | JWT obrigatório |
| Chaves helper | `src/utils/tenantStorageKeys.js` | — |

### Auth server-side (FASE 3.3)

| Camada | Arquivo |
|--------|---------|
| Senha (scrypt) | `server/auth/password.js` |
| JWT (HMAC) | `server/auth/jwt.js` |
| Serviço | `server/auth/authService.js` |
| Usuários DB | `server/db/userRepository.js` |
| Cliente API | `src/api/authApi.js` |
| Tokens cliente | `src/utils/authTokenStorage.js` |

**Papéis:** `platform_admin` | `tenant_owner` | `visitor`

**Transição gradual:** login tenta API primeiro; se falhar, usa auth legada do SiteConfig. Sessões antigas no localStorage continuam válidas na UI.

### Assinatura (FASE 3.5)

| Camada | Arquivo |
|--------|---------|
| Planos/assinaturas DB | `server/db/subscriptionRepository.js` |
| Provider cobrança | `server/billing/billingProvider.js` (manual padrão; Stripe opcional) |
| Constantes | `server/billing/billingConstants.js` |

**Planos:** `starter` (R$ 49,90/mês), `pro` (R$ 99,90/mês)

**Tenant isento:** `default` (sem cobrança)

**Novas lojas:** trial 14 dias no plano Starter

**Provider padrão:** `BILLING_PROVIDER=manual` (checkout simula pagamento)

**Stripe (opcional):** `BILLING_PROVIDER=stripe`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`

**Bloqueio:** API retorna 403 `SUBSCRIPTION_INACTIVE` → loja mostra aviso simples (sem mudar layout)

### User data (FASE 3.6)

| Camada | Arquivo |
|--------|---------|
| SQLite | tabela `user_data` |
| Schema/normalize | `server/db/userDataSchema.js` |
| Repositório | `server/db/userDataRepository.js` |
| Cliente API | `src/api/userDataApi.js` |
| Repositório frontend | `src/data/userDataRepository.js` |

**Fluxo:** login com JWT → API remota → cache localStorage; sem token mantém só local.

**Endpoints:** `GET/PUT /api/tenants/:id/user-data` (visitante ou dono da loja autenticado)

### Produção (FASE 4)

| Item | Detalhe |
|------|---------|
| Servidor unificado | `server/index.js` serve API + `dist/` quando `NODE_ENV=production` |
| Dev local | `INICIAR-SITE.bat` (API :3001 + Vite :5173) |
| Prod local | `INICIAR-PRODUCAO.bat` ou `npm run build:prod` |
| Variáveis | `.env.example` → copiar para `.env` |
| Health | `GET /api/health` |
| Postgres/Supabase | `server/db/schema.postgres.sql` + `npm run db:migrate:postgres` |
| Runtime DB | SQLite (`store.db`) — Postgres schema preparado, repositórios ainda SQLite |

**Deploy sugerido (VPS/Railway):** ver seção **Deploy remoto** abaixo.

### Deploy remoto

Arquivos: `Dockerfile`, `railway.toml`, `docker-compose.yml`

#### Opção A — Railway (recomendado)

1. Suba o projeto no **GitHub**
2. Acesse [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Selecione o repositório `cell-prime-store`
4. Railway detecta `railway.toml` + `Dockerfile` automaticamente
5. **Variables** (Settings → Variables):

| Variável | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `true` |
| `JWT_SECRET` | segredo longo e aleatório |
| `CORS_ORIGIN` | `https://seudominio.com` |
| `APP_BASE_URL` | `https://seudominio.com` |
| `VITE_TENANT_BASE_DOMAINS` | `seudominio.com` |
| `STORE_DB_PATH` | `/app/server/data/store.db` |
| `BILLING_PROVIDER` | `manual` ou `stripe` |

6. **Volume persistente** (obrigatório para não perder lojas):
   - Settings → Volumes → Add Volume
   - Mount path: `/app/server/data`
7. **Domínio customizado:**
   - Settings → Networking → Custom Domain → `seudominio.com`
   - No DNS (Cloudflare recomendado):
     - `CNAME` `@` → URL do Railway
     - `CNAME` `*` → URL do Railway (wildcard para lojas `demo.seudominio.com`)
8. **Rebuild** após alterar `VITE_TENANT_BASE_DOMAINS` (é variável de build)
9. Verifique: `https://seudominio.com/api/health`

**URLs em produção:**
- Loja principal: `https://seudominio.com`
- Loja demo: `https://demo.seudominio.com`
- Plataforma: `https://seudominio.com/platform` ou `https://platform.seudominio.com`

#### Opção B — VPS / Docker Compose

```bash
# No servidor (Linux)
git clone <seu-repo> && cd cell-prime-store
cp .env.example .env   # edite JWT_SECRET e domínios
docker compose up -d --build
```

- Porta exposta: **3001** (coloque Nginx/Caddy na frente com HTTPS)
- Volume `koryn_data` persiste o SQLite
- Health: `curl http://localhost:3001/api/health`

#### Opção C — Supabase (banco apenas, futuro)

1. Crie projeto no Supabase → copie `DATABASE_URL`
2. Local: `DATABASE_URL=... npm run db:migrate:postgres`
3. Runtime Postgres nos repositórios ainda pendente — produção atual usa SQLite + volume

#### Por que não Vercel?

Este projeto usa **um servidor Node único** (API + SQLite + arquivos estáticos). Vercel é serverless e não persiste SQLite. Use Railway ou VPS.

---

## API HTTP (porta 3001)

| Método | Rota | Status |
|--------|------|--------|
| GET | `/api/tenants` | ✅ (ativos) |
| GET | `/api/tenants?all=1` | ✅ (todos, painel plataforma) |
| POST | `/api/tenants` | ✅ |
| PATCH | `/api/tenants/:id` | ✅ |
| GET | `/api/tenants/:id/config` | ✅ |
| PUT | `/api/tenants/:id/config` | ✅ (requer `tenant_owner` ou `platform_admin`) |
| POST | `/api/auth/login` | ✅ |
| POST | `/api/auth/register` | ✅ |
| GET | `/api/auth/me` | ✅ |
| GET | `/api/billing/plans` | ✅ |
| POST | `/api/billing/checkout` | ✅ |
| POST | `/api/billing/webhook/stripe` | ✅ (quando Stripe configurado) |
| GET | `/api/tenants/:id/subscription` | ✅ |
| PATCH | `/api/tenants/:id/subscription` | ✅ (platform_admin) |
| GET | `/api/tenants/:id/user-data` | ✅ (JWT visitante/dono) |
| PUT | `/api/tenants/:id/user-data` | ✅ (JWT visitante/dono) |
| GET | `/api/health` | ✅ |

### Painel plataforma (FASE 3.2+)

| Item | Detalhe |
|------|---------|
| URL | http://localhost:5173/platform |
| Login | `admin@koryntech.com` / `korynadmin` via `POST /api/auth/login` (`scope: platform`) |
| Token | `sessionStorage` → `koryn-tech-platform-auth-token` |
| Frontend | `src/platform/PlatformApp.jsx`, `platformApi.js`, `platformAuth.js` |
| Roteamento | `main.jsx` detecta `pathname.startsWith('/platform')` — **não** carrega providers da loja |

**Rotas protegidas:** `POST/PATCH /api/tenants`, `GET /api/tenants?all=1` → `platform_admin`; `PUT .../config` → dono da loja ou plataforma.

---

## Como rodar

```bash
# Desenvolvimento — Windows
INICIAR-SITE.bat

# Desenvolvimento — manual
node server/index.js          # API :3001
npm run dev                   # Site :5173

# Produção local (API + site na mesma porta)
INICIAR-PRODUCAO.bat
# ou
npm run build:prod

# Supabase/Postgres — apenas schema (quando DATABASE_URL definida)
npm run db:migrate:postgres
```

**URLs de teste (dev):**
- Loja padrão: http://localhost:5173
- Loja demo (query): http://localhost:5173/?loja=demo
- Loja demo (subdomínio): http://demo.localhost:5173
- Painel plataforma: http://localhost:5173/platform ou http://platform.localhost:5173

**URLs de teste (produção local):**
- Tudo em: http://localhost:3001 (site + API + `/platform`)

**Vite (dev):** `allowedHosts` inclui `.localhost` e `.lvh.me` — ver `vite.config.js`

**Produção:** configure DNS wildcard `*.seudominio.com` e `VITE_TENANT_BASE_DOMAINS=seudominio.com`

---

## Providers React (ordem em `main.jsx`)

```
TenantProvider
  SiteConfigProvider
    AuthProvider
      ThemeProvider
        UserDataProvider
          App
```

---

## Histórico de entregas

### FASE 1
- Centralizado `loadStoreConfig` / `saveStoreConfig` com localStorage

### FASE 2
- TenantContext, API JSON, adapters local/remoto, isolamento por tenant

### FASE 3.1
- SQLite (`server/data/store.db`) como fonte primária no servidor
- Migração automática dos JSON em `server/data/tenants/*.json`
- JSON legado mantido (backup); API lê/escreve no banco

### FASE 3.2
- Painel `/platform` para super-admin gerenciar lojas
- API: `POST /api/tenants`, `PATCH /api/tenants/:id`, `GET /api/tenants?all=1`
- Loja pública inalterada (rota separada em `main.jsx`)

### FASE 3.3
- JWT no servidor (tabela `users` no SQLite)
- Papéis: `platform_admin`, `tenant_owner`, `visitor`
- Endpoints `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- Rotas sensíveis protegidas; login da loja migra gradualmente (API + fallback local)

### FASE 3.4
- Tenant por subdomínio (`demo.localhost`, `demo.seudominio.com`)
- Compatível com `?loja=`; Vite `allowedHosts` para `.localhost`
- `platform.localhost` abre painel da plataforma

### FASE 3.5
- Planos e assinaturas no SQLite; trial 14 dias para novas lojas
- Checkout manual (dev) + estrutura Stripe (produção)
- Loja bloqueada quando assinatura inativa; painel plataforma gerencia status

### FASE 3.6
- Carrinho, favoritos e pedidos sincronizados via API (`user_data` no SQLite)
- Repositório frontend com fallback local; localStorage preservado
- Migração automática: se só local tiver dados, sobe na primeira sync autenticada

### FASE 4
- Servidor de produção unificado (API + frontend estático)
- `.env.example`, health check, CORS/JWT configuráveis
- Schema Postgres/Supabase + script `db:migrate:postgres`
- `INICIAR-PRODUCAO.bat` para testar produção localmente
- Deploy: `Dockerfile`, `railway.toml`, `docker-compose.yml`

---

## Credenciais admin padrão (tenant default)

- Admin: `admin@koryntech.com` / `korynadmin`
- Visitante demo: `cliente@koryntech.com` / `cliente123`

---

*Última atualização: FASE 4 concluída — roadmap SaaS multi-tenant completo para dev/produção local.*
