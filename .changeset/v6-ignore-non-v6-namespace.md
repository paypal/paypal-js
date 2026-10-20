---
"@paypal/paypal-js": patch
---

Only treat a v6 SDK on the window namespace as a loaded V6 core script, so a v5 SDK already on `window.paypal` no longer resolves `loadCoreSdkScript` after a failed or timed out load.
