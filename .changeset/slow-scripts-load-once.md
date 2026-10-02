---
"@paypal/paypal-js": patch
---

Prevent V6 Core SDK timeout retries from evaluating two in-flight script responses. Explicit script errors still retry, while timed-out requests now reject without inserting another script because the original request may still execute.
