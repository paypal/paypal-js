---
"@paypal/react-paypal-js": minor
---

This change implements a new feature of the Eligibility API in response to JS SDK eligibility requests. In some cases the request merchant origin was getting overwritten. This caused a bug in particular in the Google Pay payments flow. Merchants can now pass a merchant origin to the eligibility API via the server method fetchEligibleMethods.
