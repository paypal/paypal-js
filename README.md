# PayPal JS

An async loader for the [PayPal JS SDK](https://developer.paypal.com/docs/checkout/).

<a href="https://www.npmjs.com/package/@paypal/paypal-js"><img src="https://img.shields.io/npm/v/@paypal/paypal-js?style=flat-square" alt="npm version"></a>
<a href="https://github.com/paypal/paypal-js/blob/main/LICENSE.txt"><img src="https://img.shields.io/npm/l/@paypal/paypal-js?style=flat-square" alt="github license"></a>
<a href="https://travis-ci.com/github/paypal/paypal-js"><img src="https://img.shields.io/travis/com/paypal/paypal-js/main.svg?style=flat-square" alt="travis build"></a>
<a href="https://david-dm.org/paypal/paypal-js"><img src="https://img.shields.io/david/paypal/paypal-js?style=flat-square" alt="dependencies"></a>
<a href="https://david-dm.org/paypal/paypal-js?type=dev"><img src="https://img.shields.io/david/dev/paypal/paypal-js?style=flat-square" alt="dev dependencies"></a>

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

View the [full list of supported query parameters](https://developer.paypal.com/docs/checkout/reference/customize-sdk/#query-parameters).

#### Data Attributes

All options prefixed with `data-` are considered attributes. The following example adds `data-client-token` as an attribute:
```js
loadScript({ 'client-id': 'YOUR_CLIENT_ID', 'data-client-token': 'abc123xyz==' });
```

Which will load the following `<script>` asynchronously:

```html
<script data-client-token="abc123xyz==" src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
```

View the [full list of supported script parameters](https://developer.paypal.com/docs/checkout/reference/customize-sdk/#script-parameters).

### Using a CDN

The paypal-js script is also available on the [UNPKG CDN](https://unpkg.com/). The paypal.browser.js build assigns the `loadScript` function to the window object as `window.paypalLoadScript`. Here's an example:

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
