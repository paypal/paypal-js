import { useCallback, useState } from "react";

import { useCardFieldsSession } from "./useCardFields";
import { useError } from "./useError";
import { CARD_FIELDS_SESSION_TYPES } from "../components/CardFieldsProvider";
import { toError } from "../utils";

import type { ExtraFields, OneTimePaymentFlowResponse } from "../types";

export type useCardFieldsOneTimePaymentSessionReturn = {
    submit: SubmitCardFieldsOneTimePayment;
    submitResponse: OneTimePaymentFlowResponse | null;
    submitError: Error | null;
};

export type SubmitCardFieldsOneTimePayment = (
    orderId: Promise<string> | string,
    options: ExtraFields,
) => Promise<void>;

export function useCardFieldsOneTimePaymentSession(): useCardFieldsOneTimePaymentSessionReturn {
    const { cardFieldsSession, cardFieldsSessionType } = useCardFieldsSession();
    const [submitResponse, setSubmitResponse] =
        useState<OneTimePaymentFlowResponse | null>(null);
    const [submitError, setSubmitError] = useState<Error | null>(null);
    // Using the error hook here so it can participate in side-effects provided by the hook.
    // The actual errors are stored in the hook's state.
    const [, setError] = useError();

    const handleSubmitError = useCallback(
        (error: Error | null) => {
            setError(error);
            setSubmitError(error);
        },
        [setError],
    );

    const submit: SubmitCardFieldsOneTimePayment = useCallback(
        async (orderId, options) => {
            if (
                cardFieldsSessionType !==
                CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT
            ) {
                handleSubmitError(
                    toError(
                        `Invalid session type: expected ${CARD_FIELDS_SESSION_TYPES.ONE_TIME_PAYMENT}, got "${cardFieldsSessionType}"`,
                    ),
                );
                setSubmitResponse(null);
                return;
            }

            if (!cardFieldsSession) {
                handleSubmitError(toError("CardFields session not available"));
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
                handleSubmitError(null);
            } catch (error) {
                handleSubmitError(toError(error));
                setSubmitResponse(null);
            }
        },
        [cardFieldsSession, cardFieldsSessionType, handleSubmitError],
    );

    return { submit, submitResponse, submitError };
}
