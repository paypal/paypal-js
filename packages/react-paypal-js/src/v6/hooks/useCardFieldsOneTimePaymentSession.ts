import { useCallback, useState } from "react";

import { useCardFieldsSession } from "./useCardFields";
import { useError } from "./useError";
import { CARD_FIELDS_SESSION_TYPES } from "../components/CardFieldsProvider";
import { toError } from "../utils";

import type { ExtraFields, OneTimePaymentFlowResponse } from "../types";

export type useCardFieldsOneTimePaymentSessionReturn = {
    submit: SubmitCardFieldsOneTimePayment;
    submitResponse: OneTimePaymentFlowResponse | null;
    error: Error | null;
};

type SubmitCardFieldsOneTimePayment = (
    orderId: Promise<string> | string,
    options: ExtraFields,
) => Promise<void>;

export function useCardFieldsOneTimePaymentSession(): useCardFieldsOneTimePaymentSessionReturn {
    const { cardFieldsSession, cardFieldsSessionType } = useCardFieldsSession();
    const [submitResponse, setSubmitResponse] =
        useState<OneTimePaymentFlowResponse | null>(null);
    const [error, setError] = useError();

    const submit: SubmitCardFieldsOneTimePayment = useCallback(
        async (orderId, options) => {
            if (
                cardFieldsSessionType !==
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT
            ) {
                setError(
                    toError(
                        `Invalid session type: expected ${CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT}, got "${cardFieldsSessionType}"`,
                    ),
                );
                setSubmitResponse(null);
                return;
            }

            if (!cardFieldsSession) {
                setError(toError("CardFields session not available"));
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
        [cardFieldsSession, cardFieldsSessionType, setError],
    );

    return { submit, submitResponse, error };
}
