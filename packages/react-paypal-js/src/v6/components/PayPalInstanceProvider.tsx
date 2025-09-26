import React, { useEffect, useState } from "react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { InstanceContext } from "../context/InstanceProviderContext";
import { isServer } from "../../utils";

import type {
    CreateInstanceOptions,
    Components,
    SdkInstance,
    EligiblePaymentMethodsOutput,
    LoadCoreSdkScriptOptions,
} from "../types";

interface PayPalInstanceProviderProps {
    options: CreateInstanceOptions<readonly [Components, ...Components[]]>;
    children: React.ReactNode;
    scriptOptions: LoadCoreSdkScriptOptions;
}

export const PayPalInstanceProvider: React.FC<PayPalInstanceProviderProps> = ({
    options,
    children,
    scriptOptions,
}: {
    options: CreateInstanceOptions<readonly [Components, ...Components[]]>;
    children: React.ReactNode;
    scriptOptions: LoadCoreSdkScriptOptions;
}) => {
    const [sdkInstance, setSdkInstance] = useState<SdkInstance<
        readonly [Components, ...Components[]]
    > | null>(null);
    const [eligiblePaymentMethods, setEligiblePaymentMethods] =
        useState<EligiblePaymentMethodsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Skip if SSR
        if (isServer) {
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        const initializeSdk = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const paypalNameSapce = await loadCoreSdkScript(scriptOptions);

                if (controller.signal.aborted) {
                    return;
                }

                if (!paypalNameSapce) {
                    throw new Error("PayPal SDK failed to load");
                }

                const instance = await paypalNameSapce.createInstance(options);

                if (controller.signal.aborted) {
                    return;
                }

                setSdkInstance(instance);

                try {
                    const eligiblePaymentMethods =
                        await instance.findEligibleMethods({});

                    if (controller.signal.aborted) {
                        return;
                    }

                    setEligiblePaymentMethods(eligiblePaymentMethods);
                } catch (eligibilityErr) {
                    if (!controller.signal.aborted) {
                        console.warn(
                            "Failed to get eligible payment methods:",
                            eligibilityErr,
                        );
                    }
                }

                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    const error =
                        err instanceof Error ? err : new Error(String(err));
                    setError(error);
                    setIsLoading(false);
                }
            }
        };

        initializeSdk();

        return () => {
            controller.abort();
        };
    }, [options, scriptOptions]);

    return (
        <InstanceContext.Provider
            value={{ sdkInstance, eligiblePaymentMethods, isLoading, error }}
        >
            {children}
        </InstanceContext.Provider>
    );
};
