---
"@paypal/paypal-js": patch
---

Fix incomplete prototype-pollution protection in `processOptions`. The `environment` option was still read via destructuring, which reads through the prototype chain, so `Object.prototype.environment = "sandbox"` could downgrade a production checkout to the sandbox SDK URL. `environment` is now read with a `hasOwnProperty` guard, matching the existing `sdkBaseUrl` protection (LI-163690 / HackerOne #3660468).
