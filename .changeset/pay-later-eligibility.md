---
"@paypal/react-paypal-js": patch
---

Integrate useEligibleMethods hook into PayLaterOneTimePaymentButton component to automatically fetch and dispatch eligibility to context. Also fixes React Strict Mode compatibility by resetting lastFetchRef on cleanup.
