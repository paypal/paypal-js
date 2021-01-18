# react-paypal-js

> React components for the [PayPal JS SDK](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/)

<div class="badges">
    <a href="https://github.com/paypal/react-paypal-js/actions?query=workflow%3Avalidate"><img src="https://img.shields.io/github/workflow/status/paypal/react-paypal-js/validate?logo=github&style=flat-square" alt="build status"></a>
    <a href="https://codecov.io/github/paypal/react-paypal-js/"><img src="https://img.shields.io/codecov/c/github/paypal/react-paypal-js.svg?style=flat-square" alt="coverage"></a>
    <a href="https://www.npmjs.com/package/@paypal/react-paypal-js"><img src="https://img.shields.io/npm/v/@paypal/react-paypal-js.svg?style=flat-square" alt="npm version"></a>
    <a href="https://www.npmtrends.com/@paypal/react-paypal-js"><img src="https://img.shields.io/npm/dm/@paypal/react-paypal-js.svg?style=flat-square" alt="npm downloads"></a>
    <a href="https://github.com/paypal/react-paypal-js/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@paypal/react-paypal-js.svg?style=flat-square" alt="apache license"></a>
    <a href="https://paypal.github.io/react-paypal-js/"><img src="https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg" alt="storybook"></a>
</div>

## Why use react-paypal-js?

### The Problem

Developers integrating with PayPal are expected to add the JS SDK `<script>` to a website and then render components like the PayPal Buttons after the script loads. This architecture works great for simple websites but can be challenging when building single page apps.

React developers think in terms of components and not about loading external scripts from an index.html file. It's easy to end up with a React PayPal integration that's sub-optimal and hurts the buyer's user experience. For example, abstracting away all the implementation details of the PayPal Buttons into a single React component is an anti-pattern because it tightly couples script loading with rendering. It's also problematic when you need to render multiple different PayPal components that share the same global script parameters.

### The Solution

`react-paypal-js` provides a solution to developers to abstract away complexities around loading the JS SDK. It enforces best practices by default so buyers get the best possible user experience.

**Features**

-   Enforce async loading the JS SDK up front so when it's time to render the buttons to your buyer, they render immediately.
-   Abstract away the complexity around loading the JS SDK with the global `<PayPalScriptProvider>` component.
-   Support dispatching actions to reload the JS SDK and re-render components when global parameters like `currency` change.
-   Easy to use components for all the different PayPal product offerings:
    -   `<PayPalButtons />`
    -   `<PayPalMarks />`
    -   `<PayPalMessages />`

## Installation

To get started, install react-paypal-js with npm.

```sh
npm install @paypal/react-paypal-js
```

## Usage

This PayPal React library consists of two main parts:

1. Context Provider - this `<PayPalScriptProvider />` component manages loading the JS SDK script. Add it to the root of your React app. It uses the [Context API](https://reactjs.org/docs/context.html) for managing state and communicating to child components. It also supports reloading the script when parameters change.
2. SDK Components - components like `<PayPalButtons />` are used to render the UI for PayPal products served by the JS SDK.

```js
// App.js
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function App() {
    return (
        <PayPalScriptProvider options={{ "client-id": "sb" }}>
            <PayPalButtons style={{ layout: "horizontal" }} />
        </PayPalScriptProvider>
    );
}
```

### PayPalButtons

The `<PayPalButtons />` component is fully documented in Storybook. Checkout the [docs page for the PayPalButtons](https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalbuttons--default) to learn more about the available props.

### PayPalScriptProvider

The `<PayPalScriptProvider />` component is designed to be used with the `usePayPalScriptReducer` hook for managing global state. This `usePayPalScriptReducer` hook has the same API as [React's useReducer hook](https://reactjs.org/docs/hooks-reference.html#usereducer).

#### Tracking loading state

The `usePayPalScriptReducer` hook provides an easy way to tap into the loading state of the JS SDK script. This state can be used to show a loading spinner while the script loads or an error message if it fails to load. The following derived attributes are provided for tracking this loading state:

-   isPending - not finished loading (default state)
-   isResolved - successfully loaded
-   isRejected - failed to load

For example, here's how you can use it to show a loading spinner.

```js
const [{ isPending }] = usePayPalScriptReducer();

return (
    <>
        {isPending ? <div className="spinner" /> : null}
        <PayPalButtons />
    </>
);
```

To learn more, check out the [loading spinner example in storybook](https://paypal.github.io/react-paypal-js/?path=/story/example-usepaypalscriptreducer--loading-spinner).

#### Reloading when parameters change

The `usePayPalScriptReducer` hook can be used to reload the JS SDK script when parameters like currency change. It provides the action `resetOptions` for reloading with new parameters. For example, here's how you can use it to change currency.

```js
const [{ scriptOptions }, dispatch] = usePayPalScriptReducer();
const [currency, setCurrency] = useState(scriptOptions.currency);

function onCurrencyChange({ target: { value } }) {
    setCurrency(value);
    dispatch({
        type: "resetOptions",
        value: {
            ...scriptProviderOptions,
            currency: value,
        },
    });
}

return (
    <>
        <select value={currency} onChange={onCurrencyChange}>
            <option value="USD">United States dollar</option>
            <option value="EUR">Euro</option>
        </select>
        <PayPalButtons />
    </>
);
```

To learn more, check out the [dynamic currency example in storybook](https://paypal.github.io/react-paypal-js/?path=/story/example-usepaypalscriptreducer--currency).

### Browser Support

This library supports all popular browsers, including IE 11. It provides the same browser support as the JS SDK. Here's the [full list of supported browsers](https://developer.paypal.com/docs/business/checkout/reference/browser-support/#supported-browsers-by-platform).
