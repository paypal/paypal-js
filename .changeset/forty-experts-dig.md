---
"@paypal/react-paypal-js": patch
---

Fix useEligibleMethods to correctly trigger new API request when payload changes. Previously, if eligibility data already existed in context, the hook would skip fetching even when a different payload was provided. Now the hook compares the current payload with the stored payload using deep equality to determine if a new request is needed.
