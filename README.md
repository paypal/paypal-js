# paypal-js

> A client-side loader for the [PayPal JS SDK](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/)

[![build status][build-badge]][build]
[![code coverage][coverage-badge]][coverage]
[![npm version][version-badge]][package]
[![bundle size][minzip-badge]][bundlephobia]
[![npm downloads][downloads-badge]][npmtrends]
[![apache license][license-badge]][license]

[build-badge]: https://img.shields.io/github/workflow/status/paypal/paypal-js/validate?logo=github&style=flat-square
[build]: https://github.com/paypal/paypal-js/actions?query=workflow%3Avalidate
[coverage-badge]: https://img.shields.io/codecov/c/github/paypal/paypal-js.svg?style=flat-square
[coverage]: https://codecov.io/github/paypal/paypal-js/
[version-badge]: https://img.shields.io/npm/v/@paypal/paypal-js.svg?style=flat-square
[package]: https://www.npmjs.com/package/@paypal/paypal-js
[minzip-badge]: https://img.shields.io/bundlephobia/minzip/@paypal/paypal-js.svg?style=flat-square
[bundlephobia]: https://bundlephobia.com/result?p=@paypal/paypal-js
[downloads-badge]: https://img.shields.io/npm/dm/@paypal/paypal-js.svg?style=flat-square
[npmtrends]: https://www.npmtrends.com/@paypal/paypal-js
[license-badge]: https://img.shields.io/npm/l/@paypal/paypal-js.svg?style=flat-square
[license]: https://github.com/paypal/paypal-js/blob/main/LICENSE

## Why use paypal-js?

The [default JS SDK code snippet](https://developer.paypal.com/docs/business/checkout/set-up-standard-payments/#sample-javascript-sdk-code) blocks page rendering:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test"></script>
<script>
    paypal.Buttons().render("body");
</script>
```

The above snippet can be difficult to implement in a non-blocking way, especially in single page web apps. This is where the paypal-js library comes in. It provides the following benefits over the above snippet:

-   Async script loading to ensure page rendering isn't blocked.
-   A [Promise API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to know when script loading is complete.
-   A convenient way to reload the script when query parameters or data attributes change.

## Installation

To get started, install paypal-js with npm.

```sh
npm install @paypal/paypal-js
```

## Usage

Import the `loadScript` function for asynchronously loading the Paypal JS SDK.

### `loadScript(options)`

-   accepts an object for passing query parameters and attributes to the JS SDK.
-   returns a Promise that resolves with `window.paypal` after the JS SDK is finished loading.

```js
import { loadScript } from "@paypal/paypal-js";

loadScript({ "client-id": "test" })
    .then((paypal) => {
        paypal.Buttons().render("#your-container-element");
    })
    .catch((err) => {
        console.error("failed to load the PayPal JS SDK script", err);
    });
```

### Passing Arguments

The `loadScript` function accepts an object for configuring the JS SDK. It's used for setting query parameters and script attributes.

#### Query Parameters

The following example adds `client-id` and `currency` as query string parameters:

```js
loadScript({ "client-id": "YOUR_CLIENT_ID", currency: "EUR" });
```

Which will load the following `<script>` asynchronously:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR"></script>
```

View the [full list of supported query parameters](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-configuration/#query-parameters).

#### Data Attributes

All options prefixed with `data-` are considered attributes. The following example adds `data-client-token` as an attribute:

```js
loadScript({
    "client-id": "YOUR_CLIENT_ID",
    "data-client-token": "abc123xyz==",
});
```

Which will load the following `<script>` asynchronously:

```html
<script
    data-client-token="abc123xyz=="
    src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"
></script>
```

View the [full list of supported script parameters](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-configuration/#script-parameters).

#### Merchant ID Array

The `merchant-id` option accepts an array to simplify the implementation for Multi-Seller Payments. With this approach the caller doesn't have to worry about managing the two different merchant id values (`data-merchant-id` and `merchant-id`).

**Here's an example with multiple `merchant-id` values:**

```js
loadScript({
    "client-id": "YOUR_CLIENT_ID",
    "merchant-id": ["123", "456", "789"],
});
```

Which will load the following `<script>` and use `merchant-id=*` to properly configure the edge cache:

```html
<script
    data-merchant-id="123,456,789"
    src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&merchant-id=*"
></script>
```

**Here's an example with one `merchant-id` value:**

```js
loadScript({
    "client-id": "YOUR_CLIENT_ID",
    "merchant-id": ["123"],
});
```

When there's only one, the merchant-id is passed in using the query string.

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&merchant-id=123"></script>
```

#### sdkBaseURL

For local development, the `sdkBaseURL` option can be used to set the base url of the JS SDK:

```js
loadScript({
    "client-id": "YOUR_CLIENT_ID",
    sdkBaseURL: "http://localhost.paypal.com:8000/sdk/js",
});
```

### Legacy Browser Support

This library relies on [JavaScript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). To support legacy browsers like IE 11, you must provide your own Promise polyfill. With a Promise polyfill this library will [support the same browsers as the JS SDK](https://developer.paypal.com/docs/business/checkout/reference/browser-support/#supported-browsers-by-platform).

The `loadScript()` function takes in a second parameter for providing a Promise ponyfill. It defaults to the global `Promise` object if it exists. There are two options for polyfilling the Promise object:

1. Use a global polyfill strategy that monkey patches the `window.Promise` API implementation.
2. Use a [ponyfill strategy](https://github.com/sindresorhus/ponyfill) that passes a Promise library into `loadScript()` without affecting other code:

```js
import { loadScript } from "@paypal/paypal-js";
import PromisePonyfill from "promise-polyfill";

loadScript(options, PromisePonyfill).then((paypalObject) => {});
```

We also provide a legacy build that includes the [promise-polyfill](https://github.com/taylorhakes/promise-polyfill) library. You can reference it from the CDN here:

```html
<script src="https://unpkg.com/@paypal/paypal-js/dist/paypal.legacy.browser.min.js"></script>
```

### Using a CDN

The paypal-js script is also available on the [unpkg CDN](https://unpkg.com/). The paypal.browser.js build assigns the `loadScript` function to the window object as `window.paypalLoadScript`. Here's an example:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <script src="https://unpkg.com/@paypal/paypal-js/dist/paypal.browser.min.js"></script>
    </head>
    <body>
        <div id="paypal-buttons"></div>
        <script>
            window.paypalLoadScript({ "client-id": "test" }).then((paypal) => {
                paypal.Buttons().render("#paypal-buttons");
            });
        </script>
    </body>
</html>
```

Note that the above CDN location points to the latest release of paypal-js. It is advised that when you deploy your site, you import the specific version you have developed and tested with (ex: https://unpkg.com/@paypal/paypal-js@2.1.3/dist/paypal.browser.min.js).

### `loadCustomScript(options)`

The `loadCustomScript` function is a generic script loader function that works with any url.

-   accepts an object for defining the script url and attributes.
-   returns a promise to indicate if the script was successfully loaded.

```js
import { loadCustomScript } from "@paypal/paypal-js";

loadCustomScript({
    url: "https://www.example.com/index.js",
    attributes: { id: "custom-id-value", "data-foo": "custom-data-attribute" },
})
    .then(() => {
        console.log("successfully loaded the custom script");
    })
    .catch((err) => {
        console.error("failed to load the custom script", err);
    });
```

## TypeScript Support

This package includes TypeScript type definitions for the PayPal JS SDK. This includes types for the `window.paypal` namespace. We support projects using TypeScript versions >= 3.8.

## Releasing

Run `npm run release` to publish a new release. The version number is determined by the git commits which follow [conventional commits spec](https://www.conventionalcommits.org).
