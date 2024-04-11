import React, { ReactNode, useEffect, useRef, useState } from "react";

import { SCRIPT_LOADING_STATE } from "../../types";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../../utils";
import { SDK_SETTINGS } from "../../constants";
import { generateMissingCardFieldsError } from "./utils";
import { PayPalCardFieldsContext } from "./context";
import { usePayPalCardFieldsRegistry } from "./hooks";

import type {
    PayPalCardFieldsComponentOptions,
    PayPalCardFieldsComponent,
    PayPalCardFieldsIndividualField,
} from "@paypal/paypal-js/types/components/card-fields";

type CardFieldsProviderProps = PayPalCardFieldsComponentOptions & {
    children: ReactNode;
};

export const PayPalCardFieldsProvider = ({
    children,
    ...props
}: CardFieldsProviderProps): JSX.Element => {
    const [{ options, loadingStatus }] = useScriptProviderContext();
    const { registerField, unregisterField } = usePayPalCardFieldsRegistry();

    const [cardFields, setCardFields] =
        useState<PayPalCardFieldsComponent | null>(null);
    const cardFieldsInstance = useRef<PayPalCardFieldsComponent | null>(null);

    const nameField = useRef<PayPalCardFieldsIndividualField | null>(null);
    const numberField = useRef<PayPalCardFieldsIndividualField | null>(null);
    const cvvField = useRef<PayPalCardFieldsIndividualField | null>(null);
    const expiryField = useRef<PayPalCardFieldsIndividualField | null>(null);

    const [isEligible, setIsEligible] = useState(false);
    // We set the error inside state so that it can be caught by React's error boundary
    const [, setError] = useState(null);

    useEffect(() => {
        // Only render the card fields when script is loaded and cardFields is eligible
        if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
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
        setCardFields(cardFieldsInstance.current);

        // Clean up after component unmounts
        return () => {
            setCardFields(null);
            cardFieldsInstance.current = null;
        };
    }, [loadingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isEligible) {
        // TODO: What should be returned here?
        return <div />;
    }

    return (
        <div style={{ width: "100%" }}>
            <PayPalCardFieldsContext.Provider
                value={{
                    cardFields,
                    nameField,
                    numberField,
                    cvvField,
                    expiryField,
                    registerField,
                    unregisterField,
                }}
            >
                {children}
            </PayPalCardFieldsContext.Provider>
        </div>
    );
};
