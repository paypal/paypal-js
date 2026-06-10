import { createContext } from "react";

import {
  BRAINTREE_DISPATCH_ACTION,
  INSTANCE_LOADING_STATE,
} from "../types/ProviderEnums";

import type { BraintreePayPalCheckoutInstance } from "../types";
import type {
  BraintreeEligiblePaymentMethodsOutput,
  BraintreeFindEligibleMethodsOptions,
} from "../types/braintree";

export interface BraintreePayPalState {
  braintreePayPalCheckoutInstance: BraintreePayPalCheckoutInstance | null;
  eligiblePaymentMethods: BraintreeEligiblePaymentMethodsOutput | null;
  eligiblePaymentMethodsPayload?: BraintreeFindEligibleMethodsOptions | null;
  loadingStatus: INSTANCE_LOADING_STATE;
  error: Error | null;
  isHydrated: boolean;
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
  | {
      type: BRAINTREE_DISPATCH_ACTION.SET_ELIGIBILITY;
      value: {
        eligiblePaymentMethods: BraintreeEligiblePaymentMethodsOutput | null;
        payload?: BraintreeFindEligibleMethodsOptions | null;
      };
    }
  | { type: BRAINTREE_DISPATCH_ACTION.SET_ERROR; value: Error }
  | { type: BRAINTREE_DISPATCH_ACTION.RESET_STATE };

export const braintreeInitialState: BraintreePayPalState = {
  braintreePayPalCheckoutInstance: null,
  eligiblePaymentMethods: null,
  eligiblePaymentMethodsPayload: null,
  loadingStatus: INSTANCE_LOADING_STATE.PENDING,
  error: null,
  isHydrated: false,
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
    case BRAINTREE_DISPATCH_ACTION.SET_ELIGIBILITY:
      return {
        ...state,
        eligiblePaymentMethods: action.value.eligiblePaymentMethods,
        eligiblePaymentMethodsPayload: action.value.payload,
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
