# Product taxonomy correction — v1.4.1

## Non-destructive correction
- Product count remains exactly 31.
- Every existing product ID remains exactly the same.
- No product was deleted, recreated, renamed, or replaced.
- All fields except the explicitly listed `brand` field remain byte-for-value equivalent at the object level.
- Prices, stock, images, descriptions, variants, ratings, sales data, tags, timestamps and supplier data are preserved.

## Brand corrections based on the actual product name
- `prod-redmi-note-14-pro-plus`: Xiaomi -> Redmi
- `prod-redmi-note-14-pro-5g`: Xiaomi -> Redmi
- `prod-redmi-note-14-5g`: Xiaomi -> Redmi
- `prod-poco-x7-pro`: Xiaomi -> POCO
- `prod-poco-f7-pro`: Xiaomi -> POCO

All five remain in the main mobile category (`cat-mobile`).

## No unnecessary category change
The Sony PlayStation consoles remain `cat-other-digital`. The DualSense Edge remains Sony and in the same main digital category because the current taxonomy has no dedicated game-controller main category. No unrelated field was changed merely for cosmetic consistency.

## Future imports
The classifier now recognizes Redmi and POCO before the broader Xiaomi rule, so newly imported products such as Redmi Note and POCO models are not mislabeled as Xiaomi.
