---
"@paypal/paypal-js": patch
---

Prevent prototype polluction security risk for sdkBaseUrl destructuring of the prototype change by adding Object.prototype.hasOwnProperty.call()
