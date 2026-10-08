# PuzzleKala Product Taxonomy — v1.5.0

## Critical persistence fix

The storefront runtime contains an embedded fallback catalog in `public/legacy/puzzlekala-ui.js` (`Ww`). Earlier patches changed `data/products.json` but did not update that embedded catalog, so AI Studio/static preview could continue showing stale brand values.

This release updates both authoritative server data and the embedded fallback catalog. It also adds `public/puzzlekala-authoritative-products.json` plus a bootstrap script that seeds the browser catalog before the legacy UI loads.

## Product-preservation invariant

- Product count: 31
- Product IDs preserved exactly
- No product deleted or recreated
- Only the `brand` field of 5 existing records changed
- `category` remains `cat-mobile` for those five records

## Brand corrections

- `prod-redmi-note-14-pro-plus` -> Redmi
- `prod-redmi-note-14-pro-5g` -> Redmi
- `prod-redmi-note-14-5g` -> Redmi
- `prod-poco-x7-pro` -> POCO
- `prod-poco-f7-pro` -> POCO

## Sources now aligned

1. `data/products.json`
2. `public/legacy/puzzlekala-ui.js` embedded catalog
3. `public/puzzlekala-authoritative-products.json`
4. browser `localStorage.puzzlekala_products` bootstrap
