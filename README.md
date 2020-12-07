# paypal-js

> A client-side loader for the [PayPal JS SDK](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/)

<a href="https://www.npmjs.com/package/@paypal/paypal-js"><img src="https://img.shields.io/npm/v/@paypal/paypal-js" alt="npm version"></a>
<a href="https://bundlephobia.com/result?p=@paypal/paypal-js"><img src="https://img.shields.io/bundlephobia/minzip/@paypal/paypal-js" alt="Bundle size minified and gzipped"></a>
<a href="https://www.npmtrends.com/@paypal/paypal-js"><img src="https://img.shields.io/npm/dm/@paypal/paypal-js" alt="npm downloads"></a>
<a href="https://github.com/paypal/paypal-js/actions?query=workflow%3ACI"><img src="https://github.com/paypal/paypal-js/workflows/CI/badge.svg" alt="CI Status"></a>
<a href="https://codecov.io/github/paypal/paypal-js"><img src="https://img.shields.io/codecov/c/github/paypal/paypal-js.svg" alt="code coverage"></a>
<a href="https://github.com/paypal/paypal-js/blob/main/LICENSE.txt"><img src="https://img.shields.io/npm/l/@paypal/paypal-js" alt="GitHub license"></a>

## Why use paypal-js?

The [default JS SDK code snippet](https://developer.paypal.com/docs/business/checkout/set-up-standard-payments/#sample-javascript-sdk-code) blocks page rendering:

```html
<script src="https://www.paypal.com/sdk/js?client-id=sb"></script>
<script>paypal.Buttons().render('body');</script>
```

The above snippet can be difficult to implement in a non-blocking way, especially in single page web apps. This is where the paypal-js library comes in. It provides the following benefits over the above snippet:

- Async script loading to ensure page rendering isn't blocked.
- A [Promise API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to know when script loading is complete.
- A convenient way to reload the script when query parameters or data attributes change.

## Installation

To get started, install paypal-js with npm.

```sh
npm install @paypal/paypal-js
```

## Usage

Import the `loadScript` function for asynchronously loading the Paypal JS SDK.

### `loadScript(options)`
- accepts an object for passing query parameters and attributes to the JS SDK.
- returns a Promise that resolves with `window.paypal` after the JS SDK is finished loading.

```js
import { loadScript } from '@paypal/paypal-js';

loadScript({ 'client-id': 'sb' })
    .then(paypal => {
        paypal.Buttons().render('#your-container-element');
    });
```

### Setting Options

The `options` object can be used to set query parameters and script attributes.

#### Query Parameters

The following example adds `client-id` and `currency` as query string parameters:

```js
loadScript({ 'client-id': 'YOUR_CLIENT_ID', 'currency': 'EUR' });
```

Which will load the following `<script>` asynchronously:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR"></script>
```

View the [full list of supported query parameters](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-configuration/#query-parameters).

#### Data Attributes

All options prefixed with `data-` are considered attributes. The following example adds `data-client-token` as an attribute:
```js
loadScript({ 'client-id': 'YOUR_CLIENT_ID', 'data-client-token': 'abc123xyz==' });
```

Which will load the following `<script>` asynchronously:

```html
<script data-client-token="abc123xyz==" src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
```

View the [full list of supported script parameters](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-configuration/#script-parameters).

### Legacy Browser Support

This library relies on [JavaScript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). To support legacy browsers like IE 11, you must provide your own Promise polyfill. With a Promise polyfill this library will [support the same browsers as the JS SDK](https://developer.paypal.com/docs/business/checkout/reference/browser-support/#supported-browsers-by-platform).

The `loadScript()` function takes in a second parameter for providing a Promise ponyfill. It defaults to the global `Promise` object if it exists. There are two options for polyfilling the Promise object:

1. Use a global polyfill strategy that monkey patches the `window.Promise` API implementation.
2. Use a [ponyfill strategy](https://github.com/sindresorhus/ponyfill) that passes a Promise library into `loadScript()` without affecting other code:

```js
import { loadScript } from '@paypal/paypal-js';
import PromisePonyfill from 'promise-polyfill';

loadScript(options, PromisePonyfill)
    .then(paypalObject => {})
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
            window.paypalLoadScript({ 'client-id': 'sb' })
                .then(paypal => {
                    paypal.Buttons().render('#paypal-buttons');
                });
        </script>
    </body>
</html>
```

Note that the above CDN location points to the latest release of paypal-js. It is advised that when you deploy your site, you import the specific version you have developed and tested with (ex: https://unpkg.com/@paypal/paypal-js@1.0.0/dist/paypal.browser.min.js).

## Releasing

Run one of the following commands to publish a new version to npm:

```bash
# bug fixes
npm run release:patch

# new functionality that's backwards compatible
npm run release:minor

# breaking changes
npm run release:major
```
