import React, { ReactNode, useEffect, useRef, useState } from "react";

import { usePayPalScriptReducer } from "../../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../../utils";
import { SDK_SETTINGS } from "../../constants";
import { generateMissingCardFieldsError } from "./utils";
import { PayPalCardFieldsContext } from "./context";
import { usePayPalCardFieldsRegistry } from "./hooks";

import type {
    PayPalCardFieldsComponentOptions,
    PayPalCardFieldsComponent,
} from "@paypal/paypal-js/types/components/card-fields";

type CardFieldsProviderProps = PayPalCardFieldsComponentOptions & {
    children: ReactNode;
};

export const PayPalCardFieldsProvider = ({
    children,
    ...props
}: CardFieldsProviderProps): JSX.Element => {
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

        try {
            cardFieldsInstance.current =
                getPayPalWindowNamespace(
                    options[SDK_SETTINGS.DATA_NAMESPACE]
                ).CardFields?.({
                    ...props,
                }) ?? null;
        } catch (error) {
            setError(() => {
                throw new Error(
                    `Failed to render <PayPalCardFieldsProvider /> component. Failed to initialize:  ${error}`
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
                    })
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
        <div style={{ width: "100%" }}>
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
        </div>
    );
};
