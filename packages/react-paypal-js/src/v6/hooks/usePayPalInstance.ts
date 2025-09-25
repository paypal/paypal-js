import { useContext } from "react";

import { InstanceContext } from "../context/InstanceProviderContext";

import type { InstanceContextState } from "../types/InstanceProviderTypes";
import type {
    Components,
    EligiblePaymentMethodsOutput,
    SdkInstance,
} from "../types";

export function usePayPalInstance(): InstanceContextState {
    const context = useContext(InstanceContext);

    if (context === null) {
        throw new Error(
            "usePayPalInstance must be used within a PayPalInstanceProvider",
        );
    }

    return context;
}

export function usePayPalSdkInstance(): SdkInstance<
    readonly [Components, ...Components[]]
> | null {
    const { sdkInstance } = usePayPalInstance();
    return sdkInstance;
}

export function usePayPalEligibleMethods(): EligiblePaymentMethodsOutput | null {
    const { eligiblePaymentMethods } = usePayPalInstance();
    return eligiblePaymentMethods;
}

export function usePayPalLoading(): boolean {
    const { isLoading } = usePayPalInstance();
    return isLoading;
}

export function usePayPalError(): Error | null {
    const { error } = usePayPalInstance();
    return error;
}
