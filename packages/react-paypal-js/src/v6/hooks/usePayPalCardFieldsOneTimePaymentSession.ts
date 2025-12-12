import { useCallback, useEffect, useState } from "react";

import { useCardFieldsSession } from "./useCardFields";
import { useError } from "./useError";
import { CARD_FIELDS_SESSION_TYPES } from "../components/CardFieldsProvider";
import { toError } from "../utils";

import type { ExtraFields, OneTimePaymentFlowResponse } from "../types";

export type usePayPalCardFieldsOneTimePaymentSessionReturn = {
    submit: SubmitPayPalCardFieldsOneTimePayment;
    submitResponse: OneTimePaymentFlowResponse | null;
    error: Error | null;
};

type SubmitPayPalCardFieldsOneTimePayment = (
    orderId: Promise<string> | string,
    options: ExtraFields,
) => Promise<void>;

/**
 * Hook for managing one-time payment Card Fields sessions.
 *
 * This hook must be used within a {@link CardFieldsProvider} to initialize
 * a one-time payment session.
 *
 * @returns {usePayPalCardFieldsOneTimePaymentSessionReturn}
 */
export function usePayPalCardFieldsOneTimePaymentSession(): usePayPalCardFieldsOneTimePaymentSessionReturn {
    const { cardFieldsSession, setCardFieldsSessionType } =
        useCardFieldsSession();
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
