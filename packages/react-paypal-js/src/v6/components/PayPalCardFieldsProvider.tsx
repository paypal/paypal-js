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
} from "../context/PayPalCardFieldsProviderContext";
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
} from "../context/PayPalCardFieldsProviderContext";
import type { usePayPalCardFieldsOneTimePaymentSession } from "../hooks/usePayPalCardFieldsOneTimePaymentSession";

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
};

/**
 * {@link PayPalCardFieldsProvider} creates a Card Fields session and provides it to child components.
 *
 * @remarks
 * Child components must use either {@link usePayPalCardFieldsOneTimePaymentSession} or
 * usePayPalCardFieldsSavePaymentSession to initialize the appropriate session type.
 * The session will not be created until one of these hooks is called.
 *
 * @example
 * <PayPalProvider
 *  components={["card-fields"]}
 *  clientToken={clientToken}
 *  pageType="checkout"
 * >
 *   <PayPalCardFieldsProvider>
 *    <CheckoutForm />
 *   </PayPalCardFieldsProvider>
 * </PayPalProvider>
 */
export const PayPalCardFieldsProvider = ({
    children,
}: CardFieldsProviderProps): JSX.Element => {
    const { sdkInstance, loadingStatus } = usePayPal();
    const [cardFieldsSession, setCardFieldsSession] =
        useState<CardFieldsSession | null>(null);
    const [cardFieldsSessionType, setCardFieldsSessionType] =
        useState<CardFieldsSessionType | null>(null);
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

        if (!cardFieldsSessionType) {
            return;
        }

        // Create Card Fields session based on sessionType
        try {
            const newCardFieldsSession =
                cardFieldsSessionType ===
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT
                    ? sdkInstance.createCardFieldsOneTimePaymentSession()
                    : sdkInstance.createCardFieldsSavePaymentSession();

            setCardFieldsSession(newCardFieldsSession);
        } catch (error) {
            handleError(toError(error));
        }

        return () => {
            setCardFieldsSession(null);
        };
    }, [sdkInstance, loadingStatus, cardFieldsSessionType, handleError]);

    const sessionContextValue: CardFieldsSessionState = useMemo(
        () => ({
            cardFieldsSession,
            setCardFieldsSessionType,
        }),
        [cardFieldsSession, setCardFieldsSessionType],
    );

    const statusContextValue: CardFieldsStatusState = useMemo(
        () => ({
            error: cardFieldsError,
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
