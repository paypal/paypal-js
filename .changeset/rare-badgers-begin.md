---
"@paypal/react-paypal-js": major
"@paypal/paypal-js": major
---

-   Updated the `@paypal/react-paypal-js` and `@paypal/paypal-js` packages to improve compatibility and performance.
-   Introduced new props for the [PayPalButtons](cci:1://file:///d:/open_source%20contributions/2_OSC/paypal-js/packages/react-paypal-js/src/components/PayPalButtons.tsx:15:0-158:2) component, including `disableMaxHeight`, `borderColor`, `borderWidth`, and `borderRadius`.

-   Enhanced the styling options for the PayPal buttons to allow for custom borders and height settings.
-   Improved error handling and eligibility checks for the PayPal buttons rendering.
-   Added support for new props to facilitate better customization and control over button rendering.

-   Resolved issues related to button rendering when wrapped in the `PayPalScriptProvider`.
-   Fixed context-related errors during testing by ensuring proper usage of hooks and providers.
