# react-paypal-js

> React components for the [PayPal JS SDK](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/)

<div class="badges">
    <a href="https://github.com/paypal/react-paypal-js/actions?query=workflow%3Avalidate"><img src="https://img.shields.io/github/actions/workflow/status/paypal/react-paypal-js/validate.yml?branch=main&logo=github&style=flat-square" alt="build status"></a>
    <a href="https://codecov.io/github/paypal/react-paypal-js/"><img src="https://img.shields.io/codecov/c/github/paypal/react-paypal-js.svg?style=flat-square" alt="coverage"></a>
    <a href="https://www.npmjs.com/package/@paypal/react-paypal-js"><img src="https://img.shields.io/npm/v/@paypal/react-paypal-js.svg?style=flat-square" alt="npm version"></a>
    <a href="https://bundlephobia.com/result?p=@paypal/react-paypal-js"><img src="https://img.shields.io/bundlephobia/minzip/@paypal/react-paypal-js.svg?style=flat-square" alt="bundle size"></a>
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

-   Enforce async loading the JS SDK upfront so when it's time to render the buttons to your buyer, they render immediately.
-   Abstract away the complexity around loading the JS SDK with the global [PayPalScriptProvider](https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalscriptprovider--default) component.
-   Support dispatching actions to reload the JS SDK and re-render components when global parameters like `currency` change.
-   Easy to use components for all the different Braintree/PayPal product offerings:
    -   [PayPalButtons](https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalbuttons--default)
    -   [PayPalMarks](https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalmarks--default)
    -   [PayPalMessages](https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalmessages--default)
    -   [PayPalHostedFields](https://paypal.github.io/react-paypal-js/?path=/docs/paypal-paypalhostedfields--default)
    -   [BraintreePayPalButtons](https://paypal.github.io/react-paypal-js/?path=/docs/braintree-braintreepaypalbuttons--default)

## Installation

To get started, install react-paypal-js with npm.

```sh
npm install @paypal/react-paypal-js
```

## Usage

This PayPal React library consists of two main parts:

1. Context Provider - this `<PayPalScriptProvider />` component manages loading the JS SDK script. Add it to the root of your React app. It uses the [Context API](https://reactjs.org/docs/context.html) for managing state and communicating to child components. It also supports reloading the script when parameters change.
2. SDK Components - components like `<PayPalButtons />` are used to render the UI for PayPal products served by the JS SDK.

```jsx
// App.js
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function App() {
    return (
        <PayPalScriptProvider options={{ clientId: "test" }}>
            <PayPalButtons style={{ layout: "horizontal" }} />
        </PayPalScriptProvider>
    );
}
```

### PayPalScriptProvider

#### Options

Use the PayPalScriptProvider `options` prop to configure the JS SDK. It accepts an object for passing query parameters and data attributes to the JS SDK script. Use camelCase for the object keys (clientId, dataClientToken, dataNamespace, etc...).

```jsx
const initialOptions = {
    clientId: "test",
    currency: "USD",
    intent: "capture",
};

export default function App() {
    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons />
        </PayPalScriptProvider>
    );
}
```

The [JS SDK Configuration guide](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-configuration/) contains the full list of query parameters and data attributes that can be used with the JS SDK.

#### deferLoading

Use the optional PayPalScriptProvider `deferLoading` prop to control when the JS SDK script loads.

-   This prop is set to false by default since we usually know all the sdk script params upfront and want to load the script right away so components like `<PayPalButtons />` render immediately.
-   This prop can be set to true to prevent loading the JS SDK script when the PayPalScriptProvider renders. Use `deferLoading={true}` initially and then dispatch an action later on in the app's life cycle to load the sdk script.

```jsx
<PayPalScriptProvider deferLoading={true} options={initialOptions}>
    <PayPalButtons />
</PayPalScriptProvider>
```

To learn more, check out the [defer loading example in storybook](https://paypal.github.io/react-paypal-js/?path=/story/example-paypalscriptprovider--default&args=deferLoading:true).

#### Tracking loading state

The `<PayPalScriptProvider />` component is designed to be used with the `usePayPalScriptReducer` hook for managing global state. This `usePayPalScriptReducer` hook has the same API as [React's useReducer hook](https://reactjs.org/docs/hooks-reference.html#usereducer).

The `usePayPalScriptReducer` hook provides an easy way to tap into the loading state of the JS SDK script. This state can be used to show a loading spinner while the script loads or an error message if it fails to load. The following derived attributes are provided for tracking this loading state:

-   isInitial - not started (only used when passing `deferLoading={true}`)
-   isPending - loading (default)
-   isResolved - successfully loaded
-   isRejected - failed to load

For example, here's how you can use it to show a loading spinner.

```jsx
const [{ isPending }] = usePayPalScriptReducer();

return (
    <>
        {isPending ? <div className="spinner" /> : null}
        <PayPalButtons />
    </>
);
```

To learn more, check out the [loading spinner example in storybook](https://paypal.github.io/react-paypal-js/?path=/story/example-paypalbuttons--default&args=showSpinner:true).

#### Reloading when parameters change

The `usePayPalScriptReducer` hook can be used to reload the JS SDK script when parameters like currency change. It provides the action `resetOptions` for reloading with new parameters. For example, here's how you can use it to change currency.

```jsx
// get the state for the sdk script and the dispatch method
const [{ options }, dispatch] = usePayPalScriptReducer();
const [currency, setCurrency] = useState(options.currency);

function onCurrencyChange({ target: { value } }) {
    setCurrency(value);
    dispatch({
        type: "resetOptions",
        value: {
            ...options,
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

To learn more, check out the [dynamic currency example in storybook](https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalbuttons--default).

### PayPalButtons

The `<PayPalButtons />` component is [documented in Storybook](https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalbuttons--default).

Here's an example:

```jsx
// App.js
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function App() {
    function createOrder() {
        return fetch("/my-server/create-paypal-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product ids and quantities
            body: JSON.stringify({
                cart: [
                    {
                        id: "YOUR_PRODUCT_ID",
                        quantity: "YOUR_PRODUCT_QUANTITY",
                    },
                ],
            }),
        })
            .then((response) => response.json())
            .then((order) => order.id);
    }
    function onApprove(data) {
          return fetch("/my-server/capture-paypal-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderID: data.orderID
            })
          })
          .then((response) => response.json())
          .then((orderData) => {
                const name = orderData.payer.name.given_name;
                alert(`Transaction completed by ${name}`);
          });

        }
    }
    return (
        <PayPalScriptProvider options={{ clientId: "test" }}>
            <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </PayPalScriptProvider>
    );
}
```

To learn more about other available props, see the [PayPalButtons](https://paypal.github.io/react-paypal-js/?path=/docs/example-paypalbuttons--default) docs.

### BraintreePayPalButtons

The Braintree SDK can be used with the PayPal JS SDK to render the PayPal Buttons. Read more about this integration in the [Braintree PayPal client-side integration docs](https://developer.paypal.com/braintree/docs/guides/paypal/client-side/javascript/v3). The `<BraintreePayPalButtons />` component is designed for Braintree merchants who want to render the PayPal button.

```jsx
// App.js
import {
    PayPalScriptProvider,
    BraintreePayPalButtons,
} from "@paypal/react-paypal-js";

export default function App() {
    return (
        <PayPalScriptProvider
            options={{
                clientId: "test",
                dataClientToken:
                    "<the data-client-token value generated by your server-side code>",
            }}
        >
            <BraintreePayPalButtons
                createOrder={(data, actions) => {
                    return actions.braintree.createPayment({
                        flow: "checkout",
                        amount: "10.0",
                        currency: "USD",
                        intent: "capture",
                    });
                }}
                onApprove={(data, actions) => {
                    return actions.braintree
                        .tokenizePayment(data)
                        .then((payload) => {
                            // call server-side endpoint to finish the sale
                        });
                }}
            />
        </PayPalScriptProvider>
    );
}
```

Check out the docs page for the [BraintreePayPalButtons](https://paypal.github.io/react-paypal-js/?path=/docs/braintree-braintreepaypalbuttons--default) to learn more about the available props.

### PayPal Hosted Fields

The JS SDK hosted-fields component provides payment form functionality that you can customize. Read more about this integration in the [PayPal Advanced Card Payments documentation](https://developer.paypal.com/docs/business/checkout/advanced-card-payments/).

There are 3 parts to the hosted-fields integration:

1. The `<PayPalHostedFieldsProvider />` provider component wraps the form field elements and accepts props like `createOrder()`.
2. The `<PayPalHostedField>` component is used for the credit card number, expiration, and cvv elements. These are customizable using props and must be children of the `<PayPalHostedFieldsProvider />` component.
3. The `usePayPalHostedFields` hook exposes the `submit()` function for submitting the payment with your own custom button.

```jsx
import {
    PayPalScriptProvider,
    PayPalHostedFieldsProvider,
    PayPalHostedField,
    usePayPalHostedFields,
} from "@paypal/react-paypal-js";

const SubmitPayment = () => {
    // Here declare the variable containing the hostedField instance
    const hostedFields = usePayPalHostedFields();

    const submitHandler = () => {
        if (typeof hostedFields.submit !== "function") return; // validate that `submit()` exists before using it
        hostedFields
            .submit({
                // The full name as shown in the card and billing address
                cardholderName: "John Wick",
            })
            .then((order) => {
                fetch(
                    "/your-server-side-integration-endpoint/capture-payment-info"
                )
                    .then((response) => response.json())
                    .then((data) => {
                        // Inside the data you can find all the information related to the payment
                    })
                    .catch((err) => {
                        // Handle any error
                    });
            });
    };

    return <button onClick={submitHandler}>Pay</button>;
};

export default function App() {
    return (
        <PayPalScriptProvider
            options={{
                clientId: "your-client-id",
                dataClientToken: "your-data-client-token",
            }}
        >
            <PayPalHostedFieldsProvider
                createOrder={() => {
                    // Here define the call to create and order
                    return fetch(
                        "/your-server-side-integration-endpoint/orders"
                    )
                        .then((response) => response.json())
                        .then((order) => order.id)
                        .catch((err) => {
                            // Handle any error
                        });
                }}
            >
                <PayPalHostedField
                    id="card-number"
                    hostedFieldType="number"
                    options={{ selector: "#card-number" }}
                />
                <PayPalHostedField
                    id="cvv"
                    hostedFieldType="cvv"
                    options={{ selector: "#cvv" }}
                />
                <PayPalHostedField
                    id="expiration-date"
                    hostedFieldType="expirationDate"
                    options={{
                        selector: "#expiration-date",
                        placeholder: "MM/YY",
                    }}
                />
                <SubmitPayment />
            </PayPalHostedFieldsProvider>
        </PayPalScriptProvider>
    );
}
```

### PayPal Card Fields

The JS SDK card-fields component provides payment form functionality that you can customize. Read more about this integration in the [PayPal Advanced Card Payments documentation](https://developer.paypal.com/docs/business/checkout/advanced-card-payments/).

#### Using Card Fields Form (recommended)

There are 3 parts to the this card-fields integration:

1. The `<PayPalCardFieldsProvider />` provider component wraps the form field elements and accepts props like `createOrder()`.
2. The `<PayPalCardFieldsForm />` component renders a form with all 4 fields included out of the box. This is an alternative for merchants who don't want to render each field individually in their react app.
3. The `usePayPalCardFields` hook exposes the `cardFieldsForm` instance that includes methods suchs as the `cardFieldsForm.submit()` function for submitting the payment with your own custom button. It also exposes the references to each of the individual components for more granular control, eg: `fields.CVVField.focus()` to programatically manipulate the element in the DOM.

```jsx
import {
    PayPalScriptProvider,
    PayPalCardFieldsProvider,
    PayPalCardFieldsForm
    usePayPalCardFields,
} from "@paypal/react-paypal-js";

const SubmitPayment = () => {
    const { cardFields, fields } = usePayPalCardFields();

    function submitHandler() {
        if (typeof cardFields.submit !== "function") return; // validate that `submit()` exists before using it

        cardFields
            .submit()
            .then(() => {
                // submit successful
            })
            .catch(() => {
                // submission error
            });
    }
    return <button onClick={submitHandler}>Pay</button>;
};

export default function App() {
    function createOrder() {
        // merchant code
    }
    function onApprove() {
        // merchant code
    }
    function onError() {
        // merchant code
    }
    return (
        <PayPalScriptProvider
            options={{
                clientId: "your-client-id",
                components: "card-fields",
            }}
        >
            <PayPalCardFieldsProvider
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
            >
                <PayPalCardFieldsForm />
                <SubmitPayment />
            </PayPalCardFieldsProvider>
        </PayPalScriptProvider>
    );
}
```

#### Using Card Fields Individually

There are 3 parts to the this card-fields integration:

1. The `<PayPalCardFieldsProvider />` provider component wraps the form field elements and accepts props like `createOrder()`.
2. The individual CardFields:
    - `<PayPalNumberField>` component used for the credit card number element. It is customizable using props and must be a child of the `<PayPalCardFieldsProvider />` component.
    - `<PayPalCVVField>` component used for the credit card cvv element. It is customizable using props and must be a child of the `<PayPalCardFieldsProvider />` component.
    - `<PayPalExpiryField>` component used for the credit card expiry element. It is customizable using props and must be a child of the `<PayPalCardFieldsProvider />` component.
    - `<PayPalNameField>` component used for the credit cardholder's name element. It is customizable using props and must be a child of the `<PayPalCardFieldsProvider />` component.
3. The `usePayPalCardFields` hook exposes the `cardFieldsForm` instance that includes methods suchs as the `cardFieldsForm.submit()` function for submitting the payment with your own custom button. It also exposes the references to each of the individual components for more granular control, eg: `fields.CVVField.focus()` to programatically manipulate the element in the DOM.

```jsx
import {
    PayPalScriptProvider,
    PayPalCardFieldsProvider,
    PayPalNameField,
    PayPalNumberField,
    PayPalExpiryField,
    PayPalCVVField,
    usePayPalCardFields,
} from "@paypal/react-paypal-js";

const SubmitPayment = () => {
    const { cardFields, fields } = usePayPalCardFields();

    function submitHandler() {
        if (typeof cardFields.submit !== "function") return; // validate that `submit()` exists before using it

        cardFields
            .submit()
            .then(() => {
                // submit successful
            })
            .catch(() => {
                // submission error
            });
    }
    return <button onClick={submitHandler}>Pay</button>;
};

// Example using individual card fields
export default function App() {
    function createOrder() {
        // merchant code
    }
    function onApprove() {
        // merchant code
    }
    function onError() {
        // merchant code
    }
    return (
        <PayPalScriptProvider
            options={{
                clientId: "your-client-id",
                components: "card-fields",
            }}
        >
            <PayPalCardFieldsProvider
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
            >
                <PayPalNameField />
                <PayPalNumberField />
                <PayPalExpiryField />
                <PayPalCVVField />

                <SubmitPayment />
            </PayPalCardFieldsProvider>
        </PayPalScriptProvider>
    );
}
```

### Browser Support

This library supports all popular browsers, including IE 11. It provides the same browser support as the JS SDK. Here's the [full list of supported browsers](https://developer.paypal.com/docs/business/checkout/reference/browser-support/#supported-browsers-by-platform).
