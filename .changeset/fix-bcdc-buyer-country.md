---
"@paypal/react-paypal-js": patch
---

Type the `<paypal-basic-card-button>` JSX element's buyer-country input as the kebab-case `buyer-country` attribute instead of a camelCase `buyerCountry` prop. The element's observed attribute is `buyer-country`, so a camelCase JSX prop is lowercased to `buyercountry` on React <19 and never reaches it. Buyer country is normally determined by the SDK; this only corrects the JSX type for the case where a merchant sets the attribute directly.
