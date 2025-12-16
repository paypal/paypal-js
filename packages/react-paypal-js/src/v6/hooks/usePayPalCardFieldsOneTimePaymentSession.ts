import { useCallback, useEffect, useState } from "react";

import { usePayPalCardFieldsSession } from "./usePayPalCardFields";
import { useError } from "./useError";
import { CARD_FIELDS_SESSION_TYPES } from "../components/PayPalCardFieldsProvider";
import { toError } from "../utils";

import type { SubmitOptions, OneTimePaymentFlowResponse } from "../types";
import type { PayPalCardFieldsProvider } from "../components/PayPalCardFieldsProvider";

export type usePayPalCardFieldsOneTimePaymentSessionResult = {
    submit: SubmitPayPalCardFieldsOneTimePayment;
    submitResponse: OneTimePaymentFlowResponse | null;
    error: Error | null;
};

type SubmitPayPalCardFieldsOneTimePayment = (
    orderId: Promise<string> | string,
    options?: SubmitOptions,
) => Promise<void>;

/**
 * Hook for managing one-time payment Card Fields sessions.
 *
 * This hook must be used within a {@link PayPalCardFieldsProvider} to initialize
 * a one-time payment session.
 *
 * @returns {usePayPalCardFieldsOneTimePaymentSessionResult}
 */
export function usePayPalCardFieldsOneTimePaymentSession(): usePayPalCardFieldsOneTimePaymentSessionResult {
    const { cardFieldsSession, setCardFieldsSessionType } =
        usePayPalCardFieldsSession();
    const [submitResponse, setSubmitResponse] =
        useState<OneTimePaymentFlowResponse | null>(null);
    const [error, setError] = useError();

    useEffect(() => {
        setCardFieldsSessionType(CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT);
    }, [setCardFieldsSessionType]);

    const submit: SubmitPayPalCardFieldsOneTimePayment = useCallback(
        async (orderId, options) => {
            if (!cardFieldsSession) {
                setError(
                    toError("Submit error: CardFields session not available"),
                );
                setSubmitResponse(null);
                return;
            }

            try {
                const id = await orderId;
                const submitResult = (await cardFieldsSession.submit(
                    id,
                    options,
                )) as OneTimePaymentFlowResponse;

                setSubmitResponse(submitResult);
                setError(null);
            } catch (error) {
                setError(toError(error));
                setSubmitResponse(null);
            }
        },
        [cardFieldsSession, setError],
    );

    return { submit, submitResponse, error };
}
