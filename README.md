# PayPal JS

An async loader for the PayPal JS SDK.

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
