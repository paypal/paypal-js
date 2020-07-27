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

The `options` object can be used to set query parameters, script parameters, and properties.

#### Query Parameters

The following example adds `client-id` and `currency` as query string parameters:

```js
loadScript({ 'client-id': 'YOUR_CLIENT_ID', 'currency': 'EUR' });
```

Which will render the following `<script>` tag to the DOM:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR" defer></script>
```

View the [full list of supported query parameters](https://developer.paypal.com/docs/checkout/reference/customize-sdk/#query-parameters).

#### Script Parameters

All options prefixed with `data-` are considered attributes. The following example adds `data-client-token` as an attribute:
```js
loadScript({ 'client-id': 'YOUR_CLIENT_ID', 'data-client-token': 'abc123xyz==' });
```

Which will render the following `<script>` tag:

```html
<script data-client-token="abc123xyz==" src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID" defer></script>
```

View the [full list of supported script parameters](https://developer.paypal.com/docs/checkout/reference/customize-sdk/#script-parameters).

#### Properties

By default, the `<script>` tag loads with [defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes) to ensure your web page renders as fast as possible.

The following example opts out of the default `<script defer>` behavior by setting `defer` to false:

```js
loadScript({ 'client-id': 'YOUR_CLIENT_ID', 'defer': false });
```

Which will render the following `<script>` tag:

```html
<!-- Note the absense of the `defer` property -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
```
