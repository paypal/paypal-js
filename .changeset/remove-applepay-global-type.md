---
"@paypal/react-paypal-js": minor
---

Remove PayPal's homegrown `ApplePaySession` browser-global typing from the v6 types.

`@paypal/react-paypal-js` now types Apple's native session via `@types/applepayjs` internally. If you reference Apple Pay's native browser global in your own code, use the bare `ApplePaySession` global (e.g. `typeof ApplePaySession !== "undefined" && ApplePaySession.canMakePayments()`) and install the community typings: `npm install --save-dev @types/applepayjs`.
