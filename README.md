# PayPal JS

An async loader for the PayPal JS SDK.


## Installation and usage

To get started, install paypal-js with npm.

```sh
npm install @paypal/paypal-js
```

Then import the `getScript` function for asynchronously loading the Paypal JS SDK.

```js
import { getScript } from '@paypal/paypal-js';

getScript({ clientID: 'sb' })
    .then(paypal => {
        paypal.Buttons().render('#your-container-element');
    });
```

### `getScript`

- accepts an object for passing query parameters to the JS SDK. The camelCase keys are converted to cabob-case before passing them as query parameters.
- returns a Promise that resolves with `window.paypal` after the JS SDK is finished loading.


### Using paypal-js without a build tool

```html
<script src="dist/paypal.iife.min.js"></script>
<div id="paypal-button-container"></div>
```

```js
window.paypalLoader.getScript({ clientID: 'sb' })
    .then(paypal => {
        paypal.Buttons().render('#paypal-button-container');
    });
```


### Using paypal-js with React

Use paypal-js to load the JS SDK independently from rendering the buttons.

```js
// App.js
import React from 'react';
import { getScript } from '@paypal/paypal-js';
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
