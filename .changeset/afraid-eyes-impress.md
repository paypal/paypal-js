---
"@paypal/react-paypal-js": patch
---

WHAT: Temporary fix for Braintree SDK versioning in React JS SDK. BT SDK version has been upgraded to latest version statically in the React SDK.

WHY: The BT SDK version is statically typed to an old version in our React SDK. As a short-term fix, we need to upgrade this version to the latest statically.
