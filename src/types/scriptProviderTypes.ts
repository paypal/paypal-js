import { SCRIPT_ID } from "../constants";
import { BraintreePayPalCheckout } from "./braintree/paypalCheckout";
import { SCRIPT_PROVIDER_DISPATCH_ACTION, SCRIPT_LOADING_STATE } from "./enums";
import type { ReactNode, Dispatch } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";

export interface ReactPayPalScriptOptions extends PayPalScriptOptions {
    [SCRIPT_ID]: string;
}

export type ScriptReducerAction =
    | {
          type: `${SCRIPT_PROVIDER_DISPATCH_ACTION.LOADING_STATUS}`;
          value: SCRIPT_LOADING_STATE;
      }
    | {
          type: `${SCRIPT_PROVIDER_DISPATCH_ACTION.RESET_OPTIONS}`;
          value: PayPalScriptOptions | ReactPayPalScriptOptions;
      }
    | {
          type: `${SCRIPT_PROVIDER_DISPATCH_ACTION.SET_BRAINTREE_INSTANCE}`;
          value: BraintreePayPalCheckout;
      };

export type InitialState = {
    options: ReactPayPalScriptOptions;
    loadingStatus: SCRIPT_LOADING_STATE.INITIAL | SCRIPT_LOADING_STATE.PENDING;
};

export interface ScriptContextState {
    options: ReactPayPalScriptOptions;
    loadingStatus: SCRIPT_LOADING_STATE;
    braintreePayPalCheckoutInstance?: BraintreePayPalCheckout;
    dispatch?: Dispatch<ScriptReducerAction>;
}

export interface ScriptContextDerivedState
    extends Pick<ScriptContextState, "options"> {
    isInitial: boolean;
    isPending: boolean;
    isRejected: boolean;
    isResolved: boolean;
}

export interface ScriptProviderProps {
    options: PayPalScriptOptions;
    children?: ReactNode;
    deferLoading?: boolean;
}
