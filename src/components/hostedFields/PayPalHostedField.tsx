import React from "react";
import type { FC } from "react";

import type { PayPalHostedFieldProps } from "../../types/payPalHostedFieldTypes";

/**
This `<PayPalHostedField />` component renders individual fields for [Hosted Fields](https://developer.paypal.com/docs/business/checkout/advanced-card-payments/integrate#3-add-javascript-sdk-and-card-form) integrations.
It relies on the `<PayPalHostedFieldsProvider />` parent component for managing state related to loading the JS SDK script
and execute some validations before the rendering the fields.

Use props for customizing your hosted fields. For example, here's how you would use the `style`, `className`, `id` options:

```jsx
    import {
        PayPalScriptProvider,
        PayPalHostedFieldsProvider,
        PayPalHostedField
    } from "@paypal/react-paypal-js";

    <PayPalScriptProvider options={{ "client-id": "test" }}>
        <PayPalHostedFieldsProvider
            createOrder={() => {
                // Manually call your server endpoint to create the client order
                return fetch("create_order_endpoint")
                    .then(response => response.json())
                    .then(order => order.id)
                    .catch(err => {
                        // Handle exceptions
                    })
            }}
        >
            <PayPalHostedField style={{ color: "red", border: "1px solid" }}
                id="card-number"
                hostedFieldType="number"
                options={{ selector: "#card-number", placeholder: "4111 1111 1111 1111" }} />
            <PayPalHostedField id="cvv"
                hostedFieldType="cvv"
                options={{ selector: "#cvv", placeholder: "CVV", maxlength: 3, maskInput: true }} />
            <PayPalHostedField id="expiration-date"
                hostedFieldType="expirationDate"
                options={{ selector: "#expiration-date", placeholder: "MM/YY" }} />

        </PayPalHostedFieldsProvider>
    </PayPalScriptProvider>
```

To use the PayPal hosted fields you need to define at least three fields:
    - A card number field
    - The CVV code from the client card
    - The expiration date

You can define the expiration date as a single field similar to the example above, 
or you are able to define it in two separate fields. One for the month and second for year.
You can delete the last children component form the example above and use these: 

```jsx
    <PayPalHostedField id="expiration-month"
        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_MONTH}
        options={{ selector: "#expiration-month", placeholder: "MM" }} />
    <PayPalHostedField id="expiration-year"
        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_YEAR}
        options={{ selector: "#expiration-year", placeholder: "YYYY" }} />
```

Note: Take care when using multiple instances of the PayPal Hosted Fields on the same page.
The component will fail to render when any of the selectors return more than one element.
*/
export const PayPalHostedField: FC<PayPalHostedFieldProps> = ({
    hostedFieldType, // eslint-disable-line @typescript-eslint/no-unused-vars
    options, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
}) => <div {...props} />;
