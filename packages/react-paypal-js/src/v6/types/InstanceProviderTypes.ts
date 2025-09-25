import type {
    Components,
    SdkInstance,
    EligiblePaymentMethodsOutput,
} from "./index";

export interface InstanceContextState {
    sdkInstance: SdkInstance<readonly [Components, ...Components[]]> | null;
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    isLoading: boolean;
    error: Error | null;
}
