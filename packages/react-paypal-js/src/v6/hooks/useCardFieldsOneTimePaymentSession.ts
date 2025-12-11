import { useCallback } from "react";

import { useCardFieldsSession } from "./useCardFields";
import { useError } from "./useError";
import { CARD_FIELDS_SESSION_TYPES } from "../components/CardFieldsProvider";
import { toError } from "../utils";

import type { ExtraFields, OneTimePaymentFlowResponse } from "../types";

export type useCardFieldsOneTimePaymentSessionReturn = {
    submit: SubmitCardFieldsOneTimePayment;
    error: Error | null;
};

// TODO: Having void as a potential return value doesn't seem right, what to return? undefined instead?
export type SubmitCardFieldsOneTimePayment = (
    orderId: Promise<string> | string,
    options: ExtraFields,
) => Promise<OneTimePaymentFlowResponse | void>;

export function useCardFieldsOneTimePaymentSession(): useCardFieldsOneTimePaymentSessionReturn {
    const { cardFieldsSession, cardFieldsSessionType } = useCardFieldsSession();
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

                // TODO: Should return something here? If yes, what?
                return;
            }

            if (!cardFieldsSession) {
                setError(toError("CardFields session not available"));
                // TODO: Should return something here? If yes, what?
                return;
            }

            try {
                const id = await orderId;
                const submitResult = (await cardFieldsSession.submit(
                    id,
                    options,
                )) as OneTimePaymentFlowResponse;
                setError(null);

                return submitResult;
            } catch (error) {
                setError(toError(error));
                // TODO: Should return something here? If yes, what?
                return;
            }
        },
        [cardFieldsSession, cardFieldsSessionType, setError],
    );

    return { submit, error };
}
