import React, { JSX, ReactNode, useEffect, useMemo, useState } from "react";

import { usePayPal } from "../hooks/usePayPal";
import {
    CardFieldsOneTimePaymentSession,
    CardFieldsSavePaymentSession,
} from "../types";
import {
    CardFieldsContext,
    CardFieldsState,
} from "../context/CardFieldsContext";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";
import { useError } from "../hooks/useError";
import { toError } from "../utils";

export type sessionType = "one-time-payment" | "save-payment";

export type CardFieldsSession =
    | CardFieldsOneTimePaymentSession
    | CardFieldsSavePaymentSession;

export type CardFieldsProviderProps = {
    children: ReactNode;
    sessionType: sessionType;
};

/**
 * {@link CardFieldsProvider} creates the appropriate Card Fields session based on the {@link sessionType} prop value, and then provides it to child components that require it
 *
 * @example
 * <CardFieldsProvider sessionType={"one-time-payment"}>
 *  <CheckoutForm />
 * </CardFieldsProvider>
 */
export const CardFieldsProvider = ({
    children,
    sessionType,
}: CardFieldsProviderProps): JSX.Element => {
    const { sdkInstance, loadingStatus } = usePayPal();
    const [cardFieldsSession, setCardFieldsSession] =
        useState<CardFieldsSession | null>(null);
    const [cardFieldsError, setCardFieldsError] = useState<Error | null>(null);
    // Using the error hook here so it can participate in side-effects provided by the hook.
    // The actual error instance is stored in the provider's state.
    const [, setError] = useError();

    useEffect(() => {
        // Early return: Still loading, wait for sdkInstance
        if (loadingStatus === INSTANCE_LOADING_STATE.PENDING) {
            return;
        }

        // Error case: Loading finished but no sdkInstance
        if (!sdkInstance) {
            const errorMsg = toError("no sdk instance available");
            setError(errorMsg);
            setCardFieldsError(errorMsg);
            return;
        }

        // Clear previous sdkInstance loading errors
        setError(null);
        setCardFieldsError(null);

        // Create Card Fields session based on sessionType
        setCardFieldsSession(
            sessionType === "one-time-payment"
                ? sdkInstance.createCardFieldsOneTimePaymentSession()
                : sdkInstance.createCardFieldsSavePaymentSession(),
        );

        return () => {
            setCardFieldsSession(null);
        };
    }, [sdkInstance, loadingStatus, sessionType, setError]);

    const contextValue: CardFieldsState = useMemo(
        () => ({
            cardFieldsSession,
            cardFieldsError,
        }),
        [cardFieldsSession, cardFieldsError],
    );

    return (
        <CardFieldsContext.Provider value={contextValue}>
            {children}
        </CardFieldsContext.Provider>
    );
};
