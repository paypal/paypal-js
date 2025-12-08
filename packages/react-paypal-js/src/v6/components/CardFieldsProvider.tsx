import React, {
    JSX,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { usePayPal } from "../hooks/usePayPal";
import {
    CardFieldsOneTimePaymentSession,
    CardFieldsSavePaymentSession,
} from "../types";
import {
    CardFieldsContext,
    CardFieldsState,
} from "../context/CardFieldsProviderContext";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";
import { useError } from "../hooks/useError";
import { toError } from "../utils";

import type { CardFieldsSessionType } from "../types";

export type CardFieldsSession =
    | CardFieldsOneTimePaymentSession
    | CardFieldsSavePaymentSession;

export type CardFieldsProviderProps = {
    children: ReactNode;
    sessionType: CardFieldsSessionType;
};

/**
 * {@link CardFieldsProvider} creates the appropriate Card Fields session based on the `sessionType` prop value, and then provides it to child components that require it
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

    const handleError = useCallback(
        (error: Error | null) => {
            setError(error);
            setCardFieldsError(error);
        },
        [setError],
    );

    useEffect(() => {
        // Early return: Still loading, wait for sdkInstance
        if (loadingStatus === INSTANCE_LOADING_STATE.PENDING) {
            return;
        }

        // Error case: Loading finished but no sdkInstance
        if (!sdkInstance) {
            handleError(toError("no sdk instance available"));
            return;
        }

        // Clear previous sdkInstance loading errors
        handleError(null);

        // Create Card Fields session based on sessionType
        try {
            const newCardFieldsSession =
                sessionType === "one-time-payment"
                    ? sdkInstance.createCardFieldsOneTimePaymentSession()
                    : sdkInstance.createCardFieldsSavePaymentSession();

            setCardFieldsSession(newCardFieldsSession);
        } catch (error) {
            handleError(toError(error));
        }

        return () => {
            setCardFieldsSession(null);
        };
    }, [sdkInstance, loadingStatus, sessionType, handleError]);

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
