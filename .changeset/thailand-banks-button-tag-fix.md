---
"@paypal/react-paypal-js": patch
---

Fix incorrect custom element tag for the Thailand Banks LPM button. `lpmRegistry` and `SDKWebComponents` referenced `thailand-banks-button`, but the SDK's actual custom element is `thailandbanks-button` (no hyphen between "thailand" and "banks"), so the button would never render.
