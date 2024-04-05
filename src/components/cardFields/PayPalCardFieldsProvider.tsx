import React, { ReactNode, useEffect, useRef, useState } from "react";

import { PayPalCardFieldsComponent, SCRIPT_LOADING_STATE } from "../../types";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../../utils";
import { SDK_SETTINGS } from "../../constants";
import { generateMissingCardFieldsError } from "./utils";
import {
    CardFieldsState,
    FieldState,
    PayPalCardFieldsContext,
} from "./context";

type CardFieldsProviderProps = PayPalCardFieldsComponent & {
    children: ReactNode;
};

export const PayPalCardFieldsProvider = ({
    children,
    ...props
}: CardFieldsProviderProps): JSX.Element => {
    const [{ options, loadingStatus }] = useScriptProviderContext();
    const cardFields = useRef<CardFieldsState>(null);
    const nameField = useRef<FieldState>(null);
    const numberField = useRef<FieldState>(null);
    const cvvField = useRef<FieldState>(null);
    const expiryField = useRef<FieldState>(null);

    const [isEligible, setIsEligible] = useState(false);
    // We set the error inside state so that it can be caught by React's error boundary
    const [, setError] = useState(null);

    useEffect(() => {
        // Only render the hosted fields when script is loaded and hostedFields is eligible
        if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
            return;
        }

        try {
            cardFields.current =
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

        if (!cardFields.current) {
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

        setIsEligible(cardFields.current.isEligible());

        // Clean up after component unmounts
        return () => {
            cardFields.current = null;
        };
    }, [loadingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
        return <div>loading</div>;
    }

    return (
        <div style={{ width: "100%" }}>
            {isEligible ? (
                <PayPalCardFieldsContext.Provider
                    value={{
                        cardFields,
                        nameField,
                        numberField,
                        cvvField,
                        expiryField,
                    }}
                >
                    {children}
                </PayPalCardFieldsContext.Provider>
            ) : (
                <div />
            )}
        </div>
    );
};
