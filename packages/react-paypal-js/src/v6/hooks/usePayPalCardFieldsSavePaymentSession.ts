"use client";

import { useCallback, useEffect, useState } from "react";

import { usePayPalCardFieldsSession } from "./usePayPalCardFields";
import { useError } from "./useError";
import { CARD_FIELDS_SESSION_TYPES } from "../components/PayPalCardFieldsProvider";
import { toError } from "../utils";

import type { SavePaymentFlowResponse, SubmitOptions } from "../types";
import type { PayPalCardFieldsProvider } from "../components/PayPalCardFieldsProvider";

export type UsePayPalCardFieldsSavePaymentSessionResult = {
    submit: SubmitPayPalCardFieldsSavePayment;
    submitResponse: SavePaymentFlowResponse | null;
    error: Error | null;
};

type SubmitPayPalCardFieldsSavePayment = (
    vaultSetupToken: Promise<string> | string,
    options?: SubmitOptions,
) => Promise<void>;

/**
 * Hook for managing save payment Card Fields sessions.
 *
 * This hook must be used within a {@link PayPalCardFieldsProvider} to initialize
 * a save payment session.
 *
 * @returns {UsePayPalCardFieldsSavePaymentSessionResult}
 */
export function usePayPalCardFieldsSavePaymentSession(): UsePayPalCardFieldsSavePaymentSessionResult {
    const { cardFieldsSession, setCardFieldsSessionType } =
        usePayPalCardFieldsSession();
    const [submitResponse, setSubmitResponse] =
        useState<SavePaymentFlowResponse | null>(null);
    const [error, setError] = useError();

    useEffect(() => {
        setCardFieldsSessionType(CARD_FIELDS_SESSION_TYPES.SAVE_PAYMENT);
    }, [setCardFieldsSessionType]);

    const submit: SubmitPayPalCardFieldsSavePayment = useCallback(
        async (vaultSetupToken, options) => {
            if (!cardFieldsSession) {
                setError(
                    toError("Submit error: CardFields session not available"),
                );
                setSubmitResponse(null);
                return;
            }

            try {
                const token = await vaultSetupToken;
                const submitResult = (await cardFieldsSession.submit(
                    token,
                    options,
                )) as SavePaymentFlowResponse;

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
