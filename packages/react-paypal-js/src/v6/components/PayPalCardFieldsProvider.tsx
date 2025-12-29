import React, {
    JSX,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { usePayPal } from "../hooks/usePayPal";
import { useProxyProps } from "../../hooks/useProxyProps";
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
    MerchantMessagingEvents,
    CardFieldsEventsOptions,
    UpdateOptions,
} from "../types";
import type {
    CardFieldsSessionState,
    CardFieldsStatusState,
} from "../context/PayPalCardFieldsProviderContext";
import type { usePayPalCardFieldsOneTimePaymentSession } from "../hooks/usePayPalCardFieldsOneTimePaymentSession";
import type { usePayPalCardFieldsSavePaymentSession } from "../hooks/usePayPalCardFieldsSavePaymentSession";

export type CardFieldsSession =
    | CardFieldsOneTimePaymentSession
    | CardFieldsSavePaymentSession;

export const CARD_FIELDS_SESSION_TYPES = {
    ONE_TIME_PAYMENT: "one-time-payment",
    SAVE_PAYMENT: "save-payment",
} as const;

export type CardFieldsSessionType =
    (typeof CARD_FIELDS_SESSION_TYPES)[keyof typeof CARD_FIELDS_SESSION_TYPES];

type CardFieldsEventHandlers = Partial<CardFieldsEventsOptions>;

type CardFieldsProviderProps = {
    children: ReactNode;
} & CardFieldsEventHandlers &
    UpdateOptions;

/**
 * {@link PayPalCardFieldsProvider} creates a Card Fields session and provides it to child components.
 *
 * @remarks
 * Child components must use either {@link usePayPalCardFieldsOneTimePaymentSession} or
 * {@link usePayPalCardFieldsSavePaymentSession} to initialize the appropriate session type.
 * The session will not be created until one of these hooks is called.
 *
 * @example
 * <PayPalProvider
 *  components={["card-fields"]}
 *  clientToken={clientToken}
 *  pageType="checkout"
 * >
 *   <PayPalCardFieldsProvider
 *     blur={(event) => console.log('Blur:', event)}
 *     validitychange={(event) => console.log('Validity:', event)}
 *     cardtypechange={(event) => console.log('Card type:', event)}
 *     amount={{ currencyCode: "USD", value: "100.00" }}
 *     isCobrandedEligible={true}
 *   >
 *     <CheckoutForm />
 *   </PayPalCardFieldsProvider>
 * </PayPalProvider>
 */
export const PayPalCardFieldsProvider = ({
    children,
    amount,
    isCobrandedEligible,
    ...eventHandlers
}: CardFieldsProviderProps): JSX.Element => {
    const { sdkInstance, loadingStatus } = usePayPal();
    const [cardFieldsSession, setCardFieldsSession] =
        useState<CardFieldsSession | null>(null);
    const [cardFieldsSessionType, setCardFieldsSessionType] =
        useState<CardFieldsSessionType | null>(null);
    const [cardFieldsError, setCardFieldsError] = useState<Error | null>(null);
    const [, setError] = useError();

    // Use proxy props for event handlers to avoid re-renders
    const proxyEventHandlers = useProxyProps(
        eventHandlers as Record<PropertyKey, unknown>,
    );

    // Use proxy props for update configuration
    const proxyUpdateConfig = useProxyProps({
        amount,
        isCobrandedEligible,
    } as Record<PropertyKey, unknown>);

    const handleError = useCallback(
        (error: Error | null) => {
            setError(error);
            setCardFieldsError(error);
        },
        [setError],
    );

    // Effect to create Card Fields session
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

        // Wait for session type to be set by child hooks
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

        // Cleanup: destroy session on unmount or when dependencies change
        return () => {
            setCardFieldsSession(null);
        };
    }, [sdkInstance, loadingStatus, cardFieldsSessionType, handleError]);

    // Register event handlers using proxy props
    useEffect(() => {
        if (!cardFieldsSession) {
            return;
        }

        try {
            /* 
            Register all event handlers that are defined
            by iterating over the keys of proxyEventHandlers directly
            */
            (
                Object.keys(proxyEventHandlers) as MerchantMessagingEvents[]
            ).forEach((eventName) => {
                const handler = proxyEventHandlers[eventName];
                if (handler && typeof handler === "function") {
                    cardFieldsSession.on(
                        eventName,
                        handler as CardFieldsEventsOptions[typeof eventName],
                    );
                }
            });
        } catch (error) {
            handleError(toError(`Failed to register event handlers: ${error}`));
        }
    }, [cardFieldsSession, proxyEventHandlers, handleError]);

    // Update session configuration when props change
    useEffect(() => {
        if (!cardFieldsSession) {
            return;
        }

        // Build update configuration from proxy props
        const updateOptions: UpdateOptions = {};
        let hasUpdates = false;

        if (proxyUpdateConfig.amount !== undefined) {
            updateOptions.amount =
                proxyUpdateConfig.amount as UpdateOptions["amount"];
            hasUpdates = true;
        }

        if (proxyUpdateConfig.isCobrandedEligible !== undefined) {
            updateOptions.isCobrandedEligible =
                proxyUpdateConfig.isCobrandedEligible as boolean;
            hasUpdates = true;
        }

        // Only call update if there are configuration changes
        if (!hasUpdates) {
            return;
        }

        try {
            cardFieldsSession.update(updateOptions);
        } catch (error) {
            handleError(
                toError(`Failed to update card fields configuration: ${error}`),
            );
        }
    }, [cardFieldsSession, proxyUpdateConfig, handleError]);

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
