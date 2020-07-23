# PayPal JS

An async loader for the PayPal JS SDK.


## Installation and usage

To get started, install paypal-js with npm.

```sh
npm install @paypal/paypal-js
```

Then import the `loadScript` function for asynchronously loading the Paypal JS SDK.

```js
import { loadScript } from '@paypal/paypal-js';

const options = {
    params: {
        'client-id': 'sb'
    }
};

loadScript(options)
    .then(paypal => {
        paypal.Buttons().render('#your-container-element');
    });
```

### `loadScript`

- accepts an object for passing query parameters and attributes to the JS SDK.
- returns a Promise that resolves with `window.paypal` after the JS SDK is finished loading.


### Using paypal-js without a build tool

```html
<script src="dist/paypal.min.js"></script>
<div id="paypal-button-container"></div>
```

```js
const options = {
    params: {
        'client-id': 'sb'
    }
};

window.paypalLoader.loadScript(options)
    .then(paypal => {
        paypal.Buttons().render('#paypal-button-container');
    });
```


### Using paypal-js with React

```js
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { loadScript } from '@paypal/paypal-js';

const loadingPromise = loadScript({ params: { 'client-id': 'sb' } });
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
