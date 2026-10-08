# Puzzle Kala security hardening

This package is a hardened compatibility release for the current Google AI Studio-generated storefront.

## Changes

- Removed magic admin tokens and the `x-sync-client: puzzle-bridge` authentication bypass.
- All privileged APIs now require a persisted admin/accounting session as appropriate.
- Protected virtual employee management, supplier management/sync, supplier details, and smart product registration.
- Supplier API responses use an allowlist and never expose credentials.
- Removed the working seeded admin/customer credential and personal sample customer data.
- Production static serving no longer lets `public/index.html` shadow the Vite production build.
- Added the missing `/assets/placeholder.png` fallback asset.
- Reduced request body limits and bounded public AI prompt length.
- Increased new customer password minimum to 8 characters.

## Important

This is not a substitute for a production database, HTTPS/reverse-proxy configuration, backups, payment-provider verification, or a full penetration test.

## v1.2 hardening
- Session tokens are stored as SHA-256 hashes at rest.
- Default data paths are resolved relative to the application source, not the process working directory.
- Public product responses remove credential/integration fields.
- Customer orders are validated against server-side product price/stock.
- Customer ticket ownership is assigned server-side.
- Production security headers are enabled.
