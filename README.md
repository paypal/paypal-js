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

### Using paypal-js with React

```js
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { loadScript } from '@paypal/paypal-js';

const loadingPromise = loadScript({ 'client-id': 'sb' });
let PayPalButtonsFromDriver;

export default function Checkout() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadingPromise
            .then(paypal => {
                PayPalButtonsFromDriver = paypal.Buttons.driver('react', { React, ReactDOM });
                setIsLoaded(true);
            });
    });

    if (isLoaded) {
        return <PayPalButtonsFromDriver />;
    }

    return 'loading';
}
```
