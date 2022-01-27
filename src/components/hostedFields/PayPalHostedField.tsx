import React, { useContext, useEffect } from "react";
import { PayPalHostedFieldsContext } from "../../context/payPalHostedFieldsContext";

import type { FC } from "react";
import type { PayPalHostedFieldProps } from "../../types/payPalHostedFieldTypes";

/**
This `<PayPalHostedField />` component renders individual fields for [Hosted Fields](https://developer.paypal.com/docs/business/checkout/advanced-card-payments/integrate#3-add-javascript-sdk-and-card-form) integrations.
It relies on the `<PayPalHostedFieldsProvider />` parent component for managing state related to loading the JS SDK script
and execute some validations before the rendering the fields.

To use the PayPal hosted fields you need to define at least three fields:

- A card number field
- The CVV code from the client card
- The expiration date

You can define the expiration date as a single field similar to the example below, 
or you are able to define it in [two separate fields](https://paypal.github.io/react-paypal-js//?path=/docs/paypal-paypalhostedfields--expiration-date). One for the month and second for year.

Note: Take care when using multiple instances of the PayPal Hosted Fields on the same page.
The component will fail to render when any of the selectors return more than one element.
*/
export const PayPalHostedField: FC<PayPalHostedFieldProps> = ({
    hostedFieldType, // eslint-disable-line @typescript-eslint/no-unused-vars
    options, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
}) => {
    const hostedFieldContext = useContext(PayPalHostedFieldsContext);

    useEffect(() => {
        if (!hostedFieldContext?.registerHostedField) {
            throw new Error(
                "The HostedField cannot be register in the PayPalHostedFieldsProvider parent component"
            );
        }
        // Register in the parent provider
        hostedFieldContext.registerHostedField({
            [hostedFieldType]: {
                selector: options.selector,
                placeholder: options.placeholder,
                type: options.type,
                formatInput: options.formatInput,
                maskInput: options.maskInput,
                select: options.select,
                maxlength: options.maxlength,
                minlength: options.minlength,
                prefill: options.prefill,
                rejectUnsupportedCards: options.rejectUnsupportedCards,
            },
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <div {...props} />;
};
