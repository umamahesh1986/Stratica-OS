# Stratica OS

Stratica OS is a mobile-first Expo Router application for four authenticated roles. It uses a shared design system, typed service layer, secure token storage, permission-claim-gated navigation, and foreground-only location capture.

> The supplied Stratica OS logo is used by the sign-in, authentication, and dashboard headers from `assets/stratica-logo.jpg`.
> Figtree is bundled and applied across app text and form inputs using the shared typography component.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
npm run start
```

The example environment opts into **development mock mode**. Demo identities are documented in `note.txt`; sign in with one of those emails and any password of at least four characters. They are not displayed on the sign-in screen. The selected role is derived by the development mock adapter, not chosen in the login UI. Mock mode is guarded by `__DEV__` and cannot be enabled in release builds. In a web preview, the mock token is kept only in tab-scoped `sessionStorage`; native builds use Expo SecureStore. Production web auth keeps its token in memory pending an HTTPS backend using secure, HttpOnly cookies.

For API-backed development, remove the development mock flag and set `EXPO_PUBLIC_API_URL` to the HTTPS API origin. The client will not grant roles or fall back to mock records when the service is unavailable.

## Completed screens and behavior

- **Authentication:** splash/session restoration, sign-in, forgot/reset password, server-configured OTP challenge, sign-out, and access denied. Login links to separate Distributor, Field Representative, and Product Company registration forms.
- **Registration forms:** role-specific mobile onboarding forms for legal/KYC details, territory or product portfolios, logistics, financial information, local document selection, and consent. Selected files remain in screen memory and are not uploaded or persisted. Draft persistence, secure document upload, identity/OTP verification, remaining steps, and submission require backend contracts before real applications can be accepted.
- **Stratica Admin:** overview, product companies, distributors, field representatives, merchant directory, product catalogue, supply/merchant orders, deliveries, authorized location views, finance, reports, user management, and settings.
- **Product Company Admin:** company-scoped overview, products and product requests, incoming orders with accept/reject confirmation, dispatches, distributor network, reports, notifications, and company profile.
- **Distributor Admin:** overview, inventory, audited movement forms/history, supply and merchant orders, merchants, field team, task assignments, deliveries, authorized team tracking, reports, notifications, and settings.
- **Field Representative:** assigned work, shops/details, foreground visit check-in/out, order selection/review/submission, assigned deliveries and confirmation, visit history, notifications, location permission/status, and profile/logout.
- **Shared UX:** search, status filters/badges, detail views, permission-gated actions, confirmation dialogs, touch-friendly controls, loading/empty/error/retry states, and offline/service-unavailable feedback.
- **Role themes:** Stratica Admin uses chocolate brown, caramel, and cream; Product Company Admin uses muted gold, warm taupe, and cream; Distributor Admin retains its existing sage/forest palette; Field Representatives use terracotta, soft beige, and sandy neutrals. The active palette is derived only from the authenticated session role.
- **Location:** foreground permission only; each report exposes timestamp, reported accuracy, offline/stale state, and any configured geofence radius. No background location permission or 10 m accuracy assumption is enabled.

All sample entities are explicitly labelled examples. Counts and financial values are not fabricated; the preview uses em dashes until a backend supplies authorized data. Mock-mode form submissions and visit actions fail with an explicit “not submitted” message.

## Backend contract

Set `EXPO_PUBLIC_API_URL` to the API origin. The service layer in `src/services/` sends bearer tokens and does not send a client-selected organization ID. The backend must enforce authentication, organization scoping, and authorization on **every** request.

### Authentication

- `POST /auth/login` — `{ "email": string, "password": string }`.
- Login without OTP returns `{ "requiresOtp": false, "session": AuthenticatedSession }`.
- Configured OTP returns `{ "requiresOtp": true, "challengeId": string }`; the client then calls `POST /auth/otp/verify` with `{ "challengeId": string, "code": string }`, which returns an `AuthenticatedSession`.
- `GET /auth/session` — verifies the stored bearer token and returns an `AuthenticatedSession` during restoration.
- `POST /auth/logout`.
- `POST /auth/password/forgot` with `{ "email": string }`; return a non-enumerating response.
- `POST /auth/password/reset` with `{ "token": string, "password": string }`.
- Define authorized onboarding APIs for distributor, field-representative, and product-company applications before enabling persistence, identity verification, secure document upload, draft restoration, or final submission. Registration forms allow choosing supported files locally for preview; nothing is transmitted, verified, persisted, or submitted.

`AuthenticatedSession` has `accessToken` and `user: { id, displayName, email, role, permissions, organization: { id, name, type } }`. The role must be one of `STRATICS_ADMIN`, `PRODUCT_COMPANY_ADMIN`, `DISTRIBUTOR_ADMIN`, or `FIELD_REPRESENTATIVE`. `permissions` is a server-issued string array used only to tailor navigation and available actions; it is not a substitute for backend authorization. Organization `type` must match the role.

### Operations

- `GET /v1/dashboard/overview` returns `{ metrics: [{ label, value, context?, icon }], alerts: [{ id, title, detail, severity }], updatedAt }`.
- `GET /v1/operations/{resource}` returns `{ records: OperationalRecord[], updatedAt }`.
- `GET /v1/operations/{resource}/{recordId}` returns one `OperationalRecord`.
- `POST /v1/operations/{resource}/{action}` and `POST /v1/operations/{resource}/{recordId}/{action}` perform permission-checked actions; the UI reports success only after a successful service response.
- `GET /v1/operations/merchant-orders/options` returns `{ merchants: OperationalRecord[], products: OperationalRecord[] }` scoped to the representative’s authorized order options.
- `GET /v1/operations/visits/status` returns `{ activeVisit, location, updatedAt }`.
- `POST /v1/operations/visits/check-in` accepts `{ merchantId, latitude, longitude, accuracyMeters, capturedAt }`.
- `POST /v1/operations/visits/check-out` accepts `{ visitId, latitude, longitude, accuracyMeters, capturedAt }`.

`OperationalRecord` includes `id`, `name`, `subtitle`, `status`, `updatedAt`, `description`, and optional `fields`, `location`, and `movements`. Location snapshots include `reportedAt`, `reportedAccuracyMeters`, `isOffline`, `isStale`, and optional `geofenceRadiusMeters`. Inventory movements include a movement type, positive quantity, unit, reason, timestamp, actor, and reference; do not implement stock changes as unaudited overwrites.

The current typed endpoint catalogue is `src/config/endpoints.ts`. Resource responses and permission names should be aligned with the production API before release.

## Validation and builds

```powershell
npm run lint
npm run typecheck
npx expo-doctor
npm run build:check
```

`build:check` runs Expo's production export for Android, iOS, and web. Signed native store builds require configured EAS credentials and can be created with `npx eas-cli@latest build --platform all --profile production`.

## Pending integrations

- Provide square, platform-ready launcher icon and splash artwork based on the supplied wordmark if the current generated Expo icons should also be replaced.
- Provide the HTTPS API origin and implement the authentication/operations contracts above.
- Confirm server-issued permission names and response schemas, including OTP policy and geofence configuration.
- Configure EAS project identifiers, signing credentials, and environment secrets outside the client bundle.
- Add backend-driven pagination, push notification delivery, and any approved background location policy only if required by product and privacy review.
- Resolve the current production dependency audit findings before release. `npm audit --omit=dev` reports 19 high and 7 moderate findings; its automatic suggested fix downgrades Expo to an incompatible major, so dependency updates need SDK-compatible review rather than a blind `npm audit fix`.
