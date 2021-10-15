import React, { useState, useEffect, useRef, Children } from "react";
import type { FC } from "react";

import { PayPalHostedFieldsContext } from "../../context/payPalHostedFieldsContext";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { DATA_NAMESPACE } from "../../constants";
import {
    generateHostedFieldsFromChildren,
    generateMissingHostedFieldsError,
} from "./utils";
import { validateHostedFieldChildren } from "./validators";
import { SCRIPT_LOADING_STATE } from "../../types/enums";
import { getPayPalWindowNamespace } from "../../utils";
import type { PayPalHostedFieldsComponentProps } from "../../types/payPalHostedFieldTypes";
import type {
    PayPalHostedFieldsComponent,
    HostedFieldsHandler,
} from "@paypal/paypal-js/types/components/hosted-fields";

/**
This `<PayPalHostedFieldsProvider />` provider component wraps the form field elements and accepts props like `createOrder()`.

This provider component is designed to be used with the `<PayPalHostedField />` component.
*/
export const PayPalHostedFieldsProvider: FC<PayPalHostedFieldsComponentProps> =
    ({ styles, createOrder, notEligibleError, children }) => {
        const childrenList = Children.toArray(children);
        const [{ options, loadingStatus }] = useScriptProviderContext();
        const [isEligible, setIsEligible] = useState(true);
        const [cardFields, setCardFields] =
            useState<HostedFieldsHandler | null>(null);
        const hostedFieldsContainerRef = useRef<HTMLDivElement>(null);
        const hostedFields = useRef<PayPalHostedFieldsComponent>();
        const [, setErrorState] = useState(null);

        /**
         * Executed on the mount process to validate the children
         */
        useEffect(() => {
            validateHostedFieldChildren(childrenList);
        }, []); // eslint-disable-line react-hooks/exhaustive-deps

        useEffect(() => {
            // Only render the hosted fields when script is loaded and hostedFields is eligible
            if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) return;
            // Get the hosted fields from the [window.paypal.HostedFields] SDK
            hostedFields.current ??= getPayPalWindowNamespace(
                options[DATA_NAMESPACE]
            ).HostedFields;

            if (!hostedFields.current) {
                throw new Error(
                    generateMissingHostedFieldsError({
                        components: options.components,
                        [DATA_NAMESPACE]: options[DATA_NAMESPACE],
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
                    fields: generateHostedFieldsFromChildren(childrenList),
                })
                .then((cardFieldsInstance) => {
                    setCardFields(cardFieldsInstance);
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
                    <PayPalHostedFieldsContext.Provider value={cardFields}>
                        {children}
                    </PayPalHostedFieldsContext.Provider>
                ) : (
                    notEligibleError
                )}
            </div>
        );
    };
