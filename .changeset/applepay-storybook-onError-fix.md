---
"@paypal/react-paypal-js": patch
---

Fix onError type intersection in ApplePayButtonElementProps by adding Omit<HTMLAttributes, "onError"> consistent with ButtonProps pattern
