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

Which will render the following `<script>` tag to the DOM:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR" async defer></script>
```

View the [full list of supported query parameters](https://developer.paypal.com/docs/checkout/reference/customize-sdk/#query-parameters).

#### Data Attributes

All options prefixed with `data-` are considered attributes. The following example adds `data-client-token` as an attribute:
```js
loadScript({ 'client-id': 'YOUR_CLIENT_ID', 'data-client-token': 'abc123xyz==' });
```

Which will render the following `<script>` tag:

```html
<script data-client-token="abc123xyz==" src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID" async defer></script>
```

View the [full list of supported script parameters](https://developer.paypal.com/docs/checkout/reference/customize-sdk/#script-parameters).

#### Async and Defer

The `async` and `defer` attributes can also be set. By default, the `<script>` tag loads with [async and defer](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#Attributes) to ensure your web page renders as fast as possible.

The following example opts out of the default `<script async defer>` behavior by setting `async` and `defer` to false:

```js
loadScript({ 'client-id': 'YOUR_CLIENT_ID', 'async': false, 'defer': false });
```

Which will render the following `<script>` tag:

```html
<!-- Note the absence of the `async` and `defer` attributes -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
```
