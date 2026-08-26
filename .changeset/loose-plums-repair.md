---
"@paypal/paypal-js": major
---

A breaking change that removes PayPal's homegrown `ApplePaySession` browser-global typing from the v6 types.

`@paypal/paypal-js/sdk-v6` no longer declares a stripped `ApplePaySession` class or augments the global `Window` interface with `ApplePaySession`. That augmentation conflicted with the community `@types/applepayjs` package (`TS2717` / `TS2687`), and because it shipped through the `sdk-v6` barrel it landed in every consumer's compilation — even projects that never use Apple Pay.
