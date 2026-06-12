Architecture Refactor Plan - Auth Consolidation

Goal: Create a single source of truth for auth/session/token and remove duplicated logic.

File classification (KEEP | MERGE | DELETE) with rationale

- KEEP
  - lib/auth.ts: Canonical NextAuth configuration and callbacks — keep as single NextAuth entrypoint.
  - lib/session.ts: Server-side session reader that normalizes shapes and does token refresh fallbacks — keep as server-only helper but refactor to smaller surface.
  - lib/api/services/auth.service.ts: Upstream API service implementations — keep but migrate callers to new server-client wrapper.
  - lib/api/client.ts: Generic fetch wrapper — keep but split into server-client/browser-client; do not allow it to call NextAuth directly.
  - lib/api/with-api.ts: Handler wrapper exposing serverApi — KEEP but rename/adjust once canonical modules in place.
  - app/api/auth/session/route.ts: Server route used to persist httpOnly refresh cookie — keep, adapt to canonical flows.

- MERGE (consolidate and move logic)
  - lib/auth-cookies.ts: Merge into session.ts or server-client token-persistence helpers (single implementation for refresh cookie handling).
  - lib/auth/getAccessToken.ts: Merge into session.ts as internal helper or remove in favor of serverApi token injection.
  - hooks/use-session.tsx: Merge into a new AuthProvider or replace with client-side hook that subscribes to single provider.
  - hooks/use-auth.ts: Merge into AuthProvider hook surface (useAuth) — move signIn/signOut flows to provider-based API.
  - features/session/session-persist.tsx & features/auth/components/session-persist.tsx: Merge into AuthProvider persistence responsibilities (client-only best-effort persistence).
  - lib/auth-utils.ts: Keep most helpers but move role/permission logic into a clear utilities module under `auth/` namespace.

- DELETE (remove duplicate legacy code paths)
  - ad-hoc localStorage usage (clearLocalAuth in use-auth.ts & any direct localStorage auth tokens): remove; client must not persist secrets.
  - lib/auth/getAccessToken.ts (after merge) if duplicated

Notes:
- All server-side code must rely on `getSession()` (server-only) and `withTokenRefresh()` helper for calling upstream APIs.
- `client.ts` must NOT call NextAuth or attempt to read server session; it should be a pure fetch wrapper. Create `server-client.ts` which wraps `api` and injects server token explicitly from `getSession()` via `with-api` or route helpers.
- `SiteHeader` must read from `AuthProvider` client state which should be seeded from server-provided initial props (`initialIsLoggedIn`/`initialUser`) by `SiteChrome`.

Next steps:
1. Produce a simple architecture diagram showing Server (NextAuth session, server-client), Client (AuthProvider), and Upstream (Laravel).
2. Create PR-style patch plan to implement `AuthProvider`, `server-client.ts`, and migrate a small set of routes (`with-api` consumers) as a proof-of-concept.
3. Run dev tests for SSR and session endpoint.

