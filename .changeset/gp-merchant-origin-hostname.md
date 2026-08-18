---
"@paypal/react-paypal-js": patch
---

`fetchEligibleMethods`: normalize `merchant_info.merchant_origin` to a bare hostname (strip scheme and port) before sending. Google Pay validates the origin against the merchant's registered domain (hostname — no scheme, no port); a full origin gets signed into the Google Pay `authJwt` and rejected by Google (OR_BIBED_06). Also documents the field as a bare hostname.
