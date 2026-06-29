---
"@paypal/paypal-js": patch
---

Add a `default` export condition to the `./sdk-v6` subpath so bundlers/tracers (e.g. @vercel/nft) resolve it correctly and don't fall back to the v5 entry.
