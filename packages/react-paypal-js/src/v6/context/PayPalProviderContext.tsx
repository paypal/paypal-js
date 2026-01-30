"use client";

import { createContext } from "react";

import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/PayPalProviderEnums";

import type {
    Components,
    SdkInstance,
    EligiblePaymentMethodsOutput,
} from "../types";

export interface PayPalState {
    sdkInstance: SdkInstance<readonly [Components, ...Components[]]> | null;
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    loadingStatus: INSTANCE_LOADING_STATE;
    error: Error | null;
    isHydrated: boolean;
}

export type InstanceAction =
    | {
          type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS;
          value: INSTANCE_LOADING_STATE;
      }
    | {
          type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE;
          value: SdkInstance<readonly [Components, ...Components[]]>;
      }
    | {
          type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY;
          value: EligiblePaymentMethodsOutput;
      }
    | { type: INSTANCE_DISPATCH_ACTION.SET_ERROR; value: Error }
    | {
          type: INSTANCE_DISPATCH_ACTION.RESET_STATE;
      };

export const initialState: PayPalState = {
    sdkInstance: null,
    eligiblePaymentMethods: null,
    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
    error: null,
    isHydrated: false,
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

export const PayPalContext = createContext<PayPalState | null>(null);
