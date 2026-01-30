"use client";

import { usePayPal } from "../hooks/usePayPal";
import {
    INSTANCE_LOADING_STATE,
    type EligiblePaymentMethodsOutput,
} from "../types";

export function useEligibleMethods(): {
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    isLoading: boolean;
    error: Error | null;
} {
    const { loadingStatus, eligiblePaymentMethods, error } = usePayPal();

    return {
        eligiblePaymentMethods,
        isLoading: loadingStatus === INSTANCE_LOADING_STATE.PENDING,
        error,
    };
}
