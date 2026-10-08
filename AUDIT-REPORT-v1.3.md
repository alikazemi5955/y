# PuzzleKala v1.3 — Product & Supplier Deep Audit

## Scope
Focused audit of product catalog APIs, supplier CRUD, supplier matching, credential endpoints, synchronization safety, data validation, and public/admin serialization.

## Fixed
- Strict supplier create/update whitelist; arbitrary request fields are no longer merged into supplier records.
- Supplier name, URL, connection type, ID and duplicate checks.
- Supplier deletion now validates existence, minimum supplier count, and product references.
- Supplier credential endpoint no longer returns credentials; it returns the sanitized supplier record.
- Supplier URL validation blocks embedded credentials and non-HTTP(S) protocols.
- Supplier HTTP JSON fetch has an 8 MiB response cap and protocol/embedded-credential checks.
- Product validation tightened for names, price, stock, images, variants, booleans and slug.
- Product bulk upserts now validate every product and detect duplicate IDs/slugs, including collisions with existing products.
- Product create/update now rejects duplicate slugs.
- Product deletion returns 404 when the product does not exist and records an audit event.
- Supplier match confirmation validates supplier existence, product ownership/type and supplier-product ID length.
- Price-jump approval validates numeric bounds and records an audit event.
- Admin product reads retain supplier operational metadata needed by the admin catalog while public reads still strip it.
- Supplier fetch failure cannot be interpreted as an empty catalog during synchronization.

## Important remaining architecture items
- Supplier credentials are still stored in the JSON supplier record for compatibility with existing adapters; they should be encrypted at rest before production use.
- Catalog persistence remains JSON rather than transactional DB storage.
- Supplier sync currently operates as a global sync; credential save triggers the existing global sync path.
- Pricing policy currently selects the highest matched supplier source price; this was not changed because it is business logic rather than a safe technical correction.

## Validation performed
- TypeScript parser check with `tsc --noEmit --noResolve` on server and supplier engine: no syntax diagnostics.
- JSON validation of all data files.
- Static scan for credential exposure in supplier responses.
- Static review of product/supplier routes and synchronization branches.

## v1.4 Product classification audit
- Default brand values (including Samsung/Samsung, mobile and cat-mobile) are no longer trusted as real classification values.
- Default category values are no longer allowed to block text-based classification.
- Product creation no longer initializes new records as Samsung/mobile when the user did not provide classification.
- Server sanitization reclassifies default-valued products from name/title/model/slug context.
- Seeded the server product catalog from the authoritative UI catalog so the server no longer starts with an empty product list.
- Fixed bulk `{products:[...]}` validation to compare against `req.body.products.length` rather than `req.body.length`.
