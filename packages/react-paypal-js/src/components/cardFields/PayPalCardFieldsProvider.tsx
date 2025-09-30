import React, { ReactNode, useEffect, useRef, useState } from "react";

import { usePayPalScriptReducer } from "../../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../../utils";
import { SDK_SETTINGS } from "../../constants";
import { generateMissingCardFieldsError } from "./utils";
import { PayPalCardFieldsContext } from "./context";
import { usePayPalCardFieldsRegistry } from "./hooks";
import { FullWidthContainer } from "../ui/FullWidthContainer";
import { useProxyProps } from "../../hooks/useProxyProps";

import type {
    PayPalCardFieldsComponentOptions,
    PayPalCardFieldsComponent,
} from "@paypal/paypal-js";

type CardFieldsProviderProps = PayPalCardFieldsComponentOptions & {
    children: ReactNode;
};

/**
The `<PayPalCardFieldsProvider />` is a context provider that is designed to support the rendering and state management of PayPal CardFields in your application. 

The context provider will initialize the `CardFields` instance from the JS SDK and determine eligibility to render the CardField components. Once the `CardFields` are initialized, the context provider will manage the state of the `CardFields` instance as well as the reference to each individual card field.

Passing the `inputEvents` and `style` props to the context provider will apply them to each of the individual field components.

The state managed by the provider is accessible through our custom hook `usePayPalCardFields`.

*/

export const PayPalCardFieldsProvider = ({
    children,
    ...props
}: CardFieldsProviderProps): JSX.Element => {
    const proxyInputEvents = useProxyProps(
        props.inputEvents as Record<PropertyKey, unknown>,
    );
    const proxyProps = useProxyProps(props);
    const [{ isResolved, options }] = usePayPalScriptReducer();
    const { fields, registerField, unregisterField } =
        usePayPalCardFieldsRegistry();

    const [cardFieldsForm, setCardFieldsForm] =
        useState<PayPalCardFieldsComponent | null>(null);
    const cardFieldsInstance = useRef<PayPalCardFieldsComponent | null>(null);

    const [isEligible, setIsEligible] = useState(false);
    // We set the error inside state so that it can be caught by React's error boundary
    const [, setError] = useState(null);

    useEffect(() => {
        if (!isResolved) {
            return;
        }
        if (props.inputEvents) {
            proxyProps.inputEvents = proxyInputEvents;
        }

        try {
            cardFieldsInstance.current =
                getPayPalWindowNamespace(
                    options[SDK_SETTINGS.DATA_NAMESPACE],
                ).CardFields?.({
                    ...proxyProps,
                }) ?? null;
        } catch (error) {
            setError(() => {
                throw new Error(
                    `Failed to render <PayPalCardFieldsProvider /> component. Failed to initialize:  ${error}`,
                );
            });
            return;
        }

        if (!cardFieldsInstance.current) {
            setError(() => {
                throw new Error(
                    generateMissingCardFieldsError({
                        components: options.components,
                        [SDK_SETTINGS.DATA_NAMESPACE]:
                            options[SDK_SETTINGS.DATA_NAMESPACE],
                    }),
                );
            });
            return;
        }

        setIsEligible(cardFieldsInstance.current.isEligible());
        setCardFieldsForm(cardFieldsInstance.current);

        return () => {
            setCardFieldsForm(null);
            cardFieldsInstance.current = null;
        };
    }, [isResolved]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isEligible) {
        // TODO: What should be returned here?
        return <div />;
    }

    return (
        <FullWidthContainer>
            <PayPalCardFieldsContext.Provider
                value={{
                    cardFieldsForm,
                    fields,
                    registerField,
                    unregisterField,
                }}
            >
                {children}
            </PayPalCardFieldsContext.Provider>
        </FullWidthContainer>
    );
};
