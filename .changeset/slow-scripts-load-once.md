---
"@paypal/paypal-js": patch
---

Prevent V6 Core SDK timeout retries from evaluating two in-flight script responses. Explicit script errors still retry, while slow requests now wait up to 30 seconds on the original script instead of inserting another one.
