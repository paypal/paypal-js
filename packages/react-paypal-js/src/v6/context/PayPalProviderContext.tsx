import { createContext } from "react";

import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/PayPalProviderEnums";

import type {
    PayPalContextState,
    PayPalState,
    InstanceAction,
} from "../types/PayPalProviderTypes.d.ts";

export const initialState: PayPalState = {
    sdkInstance: null,
    eligiblePaymentMethods: null,
    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
    error: null,
};

export function instanceReducer(
    state: PayPalState,
    action: InstanceAction,
): PayPalState {
    switch (action.type) {
        case INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS:
            return { ...state, loadingStatus: action.value };
        case INSTANCE_DISPATCH_ACTION.SET_INSTANCE:
            return {
                ...state,
                sdkInstance: action.value,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            };
        case INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY:
            return { ...state, eligiblePaymentMethods: action.value };
        case INSTANCE_DISPATCH_ACTION.SET_ERROR:
            return {
                ...state,
                error: action.value,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
            };
        case INSTANCE_DISPATCH_ACTION.RESET_STATE:
            return initialState;
        default:
            return state;
    }
}

export const PayPalContext = createContext<PayPalContextState | null>(null);
