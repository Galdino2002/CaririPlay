# CaririPlay architecture

This application remains front-end only until the owner explicitly adds a backend. Local data and payment flows are demonstrations, not production services.

## Layers
- Presentation: React Native screens and reusable UI components.
- Domain: deterministic business rules independent of UI.
- Services: local/mock implementations now, API adapters later.
- Infrastructure: future authentication, database, server-side booking validation and marketplace payments.

## Production safeguards
1. Never trust client-provided prices, commissions, roles, or availability.
2. Validate and reserve a time slot atomically on the server.
3. Apply server authorization and row-level security by user and venue.
4. Keep provider secrets out of the mobile bundle.
5. Confirm payments only through verified, idempotent provider webhooks.
6. Test concurrent booking attempts, cancellation, refunds and webhook retries.

## Planned sequence
1. Validate UX with customers and venue owners.
2. Keep mock data behind service boundaries.
3. Configure backend, authentication and access policies when authorized.
4. Implement atomic booking and concurrency tests.
5. Select a Brazil-compatible marketplace provider and validate onboarding, fees, refunds and settlement.
6. Add server-side payments, webhook handling, reconciliation and audit logs.
7. Complete privacy, legal/accounting and end-to-end review before production.
