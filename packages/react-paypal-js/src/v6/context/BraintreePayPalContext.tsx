import { createContext } from "react";

import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type { BraintreePayPalCheckoutInstance } from "../types";

export interface BraintreePayPalState {
    braintreePayPalCheckoutInstance: BraintreePayPalCheckoutInstance | null;
    loadingStatus: INSTANCE_LOADING_STATE;
    error: Error | null;
}

export enum BRAINTREE_DISPATCH_ACTION {
    SET_LOADING_STATUS = "setLoadingStatus",
    SET_INSTANCE = "setInstance",
    SET_ERROR = "setError",
    RESET_STATE = "resetState",
}

export type BraintreeAction =
    | {
          type: BRAINTREE_DISPATCH_ACTION.SET_LOADING_STATUS;
          value: INSTANCE_LOADING_STATE;
      }
    | {
          type: BRAINTREE_DISPATCH_ACTION.SET_INSTANCE;
          value: BraintreePayPalCheckoutInstance;
      }
    | { type: BRAINTREE_DISPATCH_ACTION.SET_ERROR; value: Error }
    | { type: BRAINTREE_DISPATCH_ACTION.RESET_STATE };

export const braintreeInitialState: BraintreePayPalState = {
    braintreePayPalCheckoutInstance: null,
    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
    error: null,
};

export function braintreeReducer(
    state: BraintreePayPalState,
    action: BraintreeAction,
): BraintreePayPalState {
    switch (action.type) {
        case BRAINTREE_DISPATCH_ACTION.SET_LOADING_STATUS:
            return { ...state, loadingStatus: action.value };
        case BRAINTREE_DISPATCH_ACTION.SET_INSTANCE:
            return {
                ...state,
                braintreePayPalCheckoutInstance: action.value,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            };
        case BRAINTREE_DISPATCH_ACTION.SET_ERROR:
            return {
                ...state,
                error: action.value,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
            };
        case BRAINTREE_DISPATCH_ACTION.RESET_STATE:
            return braintreeInitialState;
        default:
            return state;
    }
}

export const BraintreePayPalContext =
    createContext<BraintreePayPalState | null>(null);
