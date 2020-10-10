# React PayPal JS

React components for the [PayPal JS SDK](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/).

<a href="https://www.npmjs.com/package/@paypal/react-paypal-js"><img src="https://img.shields.io/npm/v/@paypal/react-paypal-js?style=flat-square" alt="npm version"></a>
<a href="https://github.com/paypal/react-paypal-js/blob/main/LICENSE.txt"><img src="https://img.shields.io/npm/l/@paypal/react-paypal-js?style=flat-square" alt="github license"></a>
<a href="https://david-dm.org/paypal/react-paypal-js"><img src="https://img.shields.io/david/paypal/react-paypal-js?style=flat-square" alt="dependencies"></a>
<a href="https://david-dm.org/paypal/react-paypal-js?type=dev"><img src="https://img.shields.io/david/dev/paypal/react-paypal-js?style=flat-square" alt="dev dependencies"></a>

https://paypal.github.io/react-paypal-js/

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

### Browser Support

This library supports all popular browsers, including IE 11. It provides the same browser support as the JS SDK. Here's the [full list of supported browsers](https://developer.paypal.com/docs/business/checkout/reference/browser-support/#supported-browsers-by-platform).
