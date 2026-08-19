---
"@paypal/paypal-js": patch
---

Make `addressLine2` and `adminArea2` required (not optional) on the LPM `LPMSessionFieldBillingAddress` type, matching the internal SDK's `BillingAddress` shape where both fields are required.
