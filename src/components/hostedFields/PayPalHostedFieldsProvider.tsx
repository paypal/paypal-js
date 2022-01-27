import React, { useState, useEffect, useRef } from "react";
import type { FC } from "react";

import { PayPalHostedFieldsContext } from "../../context/payPalHostedFieldsContext";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { SDK_SETTINGS } from "../../constants";
import {
    validateHostedFieldChildren,
    generateMissingHostedFieldsError,
} from "./utils";
import {
    PAYPAL_HOSTED_FIELDS_TYPES,
    SCRIPT_LOADING_STATE,
} from "../../types/enums";
import { getPayPalWindowNamespace } from "../../utils";
import { useHostedFieldsRegister } from "./hooks";

import type { PayPalHostedFieldsComponentProps } from "../../types/payPalHostedFieldTypes";
import type {
    PayPalHostedFieldsComponent,
    HostedFieldsHandler,
} from "@paypal/paypal-js";

/**
This `<PayPalHostedFieldsProvider />` provider component wraps the form field elements and accepts props like `createOrder()`.

This provider component is designed to be used with the `<PayPalHostedField />` component.

Warning: If you don't see anything in the screen probably your client is ineligible.
To handle this problem make sure to use the prop `notEligibleError` and pass a component with a custom message.
Take a look to this link if that is the case: https://developer.paypal.com/docs/checkout/advanced/integrate/
*/
export const PayPalHostedFieldsProvider: FC<
    PayPalHostedFieldsComponentProps
> = ({ styles, createOrder, notEligibleError, children }) => {
    const [{ options, loadingStatus }] = useScriptProviderContext();
    const [isEligible, setIsEligible] = useState<boolean>(true);
    const [cardFields, setCardFields] = useState<HostedFieldsHandler>();
    const [, setErrorState] = useState(null);
    const hostedFieldsContainerRef = useRef<HTMLDivElement>(null);
    const hostedFields = useRef<PayPalHostedFieldsComponent>();
    const [registeredFields, registerHostedField] = useHostedFieldsRegister();

    useEffect(() => {
        validateHostedFieldChildren(
            Object.keys(
                registeredFields.current
            ) as PAYPAL_HOSTED_FIELDS_TYPES[]
        );
        // Only render the hosted fields when script is loaded and hostedFields is eligible
        if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
            return;
        }
        // Get the hosted fields from the [window.paypal.HostedFields] SDK
        hostedFields.current = getPayPalWindowNamespace(
            options[SDK_SETTINGS.DATA_NAMESPACE]
        ).HostedFields;

        if (!hostedFields.current) {
            throw new Error(
                generateMissingHostedFieldsError({
                    components: options.components,
                    [SDK_SETTINGS.DATA_NAMESPACE]:
                        options[SDK_SETTINGS.DATA_NAMESPACE],
                })
            );
        }
        if (!hostedFields.current.isEligible()) {
            return setIsEligible(false);
        }
        // Clean all the fields before the rerender
        if (cardFields) {
            cardFields.teardown();
        }

        hostedFields.current
            .render({
                // Call your server to set up the transaction
                createOrder: createOrder,
                styles: styles,
                fields: registeredFields.current,
            })
            .then((cardFieldsInstance) => {
                if (hostedFieldsContainerRef.current) {
                    setCardFields(cardFieldsInstance);
                }
            })
            .catch((err) => {
                setErrorState(() => {
                    throw new Error(
                        `Failed to render <PayPalHostedFieldsProvider /> component. ${err}`
                    );
                });
            });
    }, [loadingStatus, styles]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div ref={hostedFieldsContainerRef}>
            {isEligible ? (
                <PayPalHostedFieldsContext.Provider
                    value={{
                        cardFields: cardFields,
                        registerHostedField,
                    }}
                >
                    {children}
                </PayPalHostedFieldsContext.Provider>
            ) : (
                notEligibleError
            )}
        </div>
    );
};
