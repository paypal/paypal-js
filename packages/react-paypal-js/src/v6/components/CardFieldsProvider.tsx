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
    CardFieldsSessionContext,
    CardFieldsStatusContext,
} from "../context/CardFieldsProviderContext";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";
import { useError } from "../hooks/useError";
import { toError } from "../utils";

import type {
    CardFieldsOneTimePaymentSession,
    CardFieldsSavePaymentSession,
} from "../types";
import type {
    CardFieldsSessionState,
    CardFieldsStatusState,
} from "../context/CardFieldsProviderContext";

export type CardFieldsSession =
    | CardFieldsOneTimePaymentSession
    | CardFieldsSavePaymentSession;

export const CARD_FIELDS_SESSION_TYPES = {
    ONE_TIME_PAYMENT: "one-time-payment",
    SAVE_PAYMENT: "save-payment",
} as const;

export type CardFieldsSessionType =
    (typeof CARD_FIELDS_SESSION_TYPES)[keyof typeof CARD_FIELDS_SESSION_TYPES];

type CardFieldsProviderProps = {
    children: ReactNode;
    sessionType: CardFieldsSessionType;
};

/**
 * {@link CardFieldsProvider} creates the appropriate Card Fields session based on the `sessionType` prop value, and then provides it to child components that require it.
 *
 * @example
 * <PayPalProvider
 *  components={["card-fields"]}
 *  clientToken={clientToken}
 *  pageType="checkout"
 * >
 *   <CardFieldsProvider sessionType={"one-time-payment"}>
 *    <CheckoutForm />
 *   </CardFieldsProvider>
 * </PayPalProvider>
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
                sessionType === CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT
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

    const sessionContextValue: CardFieldsSessionState = useMemo(
        () => ({
            cardFieldsSession,
            cardFieldsSessionType: sessionType,
        }),
        [cardFieldsSession, sessionType],
    );

    const statusContextValue: CardFieldsStatusState = useMemo(
        () => ({
            cardFieldsError,
        }),
        [cardFieldsError],
    );

    return (
        <CardFieldsSessionContext.Provider value={sessionContextValue}>
            <CardFieldsStatusContext.Provider value={statusContextValue}>
                {children}
            </CardFieldsStatusContext.Provider>
        </CardFieldsSessionContext.Provider>
    );
};
