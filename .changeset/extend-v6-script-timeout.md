---
"@paypal/paypal-js": minor
---

Increase the v6 `loadCoreSdkScript` per-attempt script load timeout from 30 seconds to 60 seconds so slow networks have more time to load the Core SDK script before the load is reported as timed out.
