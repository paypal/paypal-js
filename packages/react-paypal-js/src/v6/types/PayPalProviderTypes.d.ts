import type { Components, SdkInstance, EligiblePaymentMethodsOutput } from ".";
import type {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "./PayPalProviderEnums";

export interface PayPalState {
    sdkInstance: SdkInstance<readonly [Components, ...Components[]]> | null;
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    loadingStatus: INSTANCE_LOADING_STATE;
    error: Error | null;
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
          value: INSTANCE_LOADING_STATE;
      };

export interface PayPalContextState {
    sdkInstance: SdkInstance<readonly [Components, ...Components[]]> | null;
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    error: Error | null;
    dispatch: React.Dispatch<InstanceAction>;
    loadingStatus: INSTANCE_LOADING_STATE;
}
