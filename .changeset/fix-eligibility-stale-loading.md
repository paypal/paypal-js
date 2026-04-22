---
"@paypal/react-paypal-js": patch
---

Fix useEligibleMethods hook returning isLoading=false with stale eligibility data when payload changes (e.g., navigating between different payment flows)
