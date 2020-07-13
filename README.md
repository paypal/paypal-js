# PayPal JS

An async loader for the PayPal JS SDK.

```shell
npm install @paypal/paypal-js
```

## Using paypal-js without a build tool

1. Load the iife-bundle.min.js script.
2. This script adds a single global function named `window.paypalGetScript(params)`.

```html
<script src="dist/iife-bundle.min.js"></script>
<div id="paypal-button-container"></div>
```

```js
window.paypalGetScript({ clientID: 'sb' })
    .then(paypal => {
        paypal.Buttons().render('#paypal-button-container');
    });
```


## Using paypal-js with JavaScript modules (import/export)

1. Import paypal-js
2. Call the default function `getScript(params)`.

```js
import getScript from 'paypal-js';

getScript({ clientID: 'sb' })
    .then(paypal => {
        paypal.Buttons().render('#paypal-button-container');
    });
```


## Using paypal-js with React

With paypal-js the script loading can be decoupled from the rendering of the buttons.

```js
// App.js
import React from 'react';
import getScript from '@paypal/paypal-js';
import PayPalButtonsWrapper from './PayPalButtonsWrapper';

const loadingPromise = getScript({ clientID: 'sb' });

function App() {
    return (
        <PayPalButtonsWrapper loadingPromise={loadingPromise} />
    );
}

export default App;
```

```js
// PayPalButtonsWrapper.js
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

let PayPalButtons;

function PayPalButtonsWrapper(props) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        props.loadingPromise
            .then(paypal => {
                paypal.Buttons().render('#paypal-button-container');
                PayPalButtons = paypal.Buttons.driver('react', { React, ReactDOM });
                setIsLoaded(true);
            });
    });

    if (isLoaded) {
        return <PayPalButtons />;
    }

    return 'loading';
}

export default PayPalButtonsWrapper;
```
