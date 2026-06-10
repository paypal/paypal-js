---
"@paypal/paypal-js": patch
---

Add v6 web component DOM element types so non-React TypeScript integrations get strongly-typed access to the PayPal SDK custom elements. `HTMLElementTagNameMap` is augmented for `<paypal-button>`, `<venmo-button>`, `<paypal-pay-later-button>`, `<paypal-credit-button>`, `<paypal-basic-card-button>`, `<paypal-basic-card-container>`, `<paypal-message>`, and `<apple-pay-button>` (registered by Apple's Apple Pay JS SDK).

```ts
const btn = document.createElement("paypal-pay-later-button");
btn.countryCode = "US"; // typed: "AU" | "CA" | "DE" | "ES" | "FR" | "GB" | "IT" | "US"
btn.productCode = "PAYLATER"; // typed: "PAYLATER" | "PAY_LATER_SHORT_TERM"
```
