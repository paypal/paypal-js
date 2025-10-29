import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import {
    PayPalContext,
    initialState,
    instanceReducer,
} from "../context/PayPalProviderContext";
import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/PayPalProviderEnums";
import { useDeepCompareMemoize } from "../utils";

import type {
    CreateInstanceOptions,
    Components,
    LoadCoreSdkScriptOptions,
    PayPalV6Namespace,
} from "../types";

type PayPalProviderProps = CreateInstanceOptions<
    readonly [Components, ...Components[]]
> & {
    // Provider-specific properties
    children: React.ReactNode;
    // scriptOptions: LoadCoreSdkScriptOptions;
    environment?: LoadCoreSdkScriptOptions["environment"];
    debug?: LoadCoreSdkScriptOptions["debug"];
};

/**
 * PayPal SDK Instance Provider with SSR support
 *
 * SSR Behavior:
 * - Server: Initializes in INITIAL state, no script loading attempted
 * - Client: Initializes in PENDING state, loads scripts on mount
 * - Hydration: Client takes over from server state seamlessly
 *
 * Props are automatically deep-compared to prevent unnecessary SDK reloads.
 * You can pass options directly without manual memoization.
 *
 * @example
 * <PayPalProvider
 *   components={["paypal-payments"]}
 *   clientToken={token}
 *   scriptOptions={{ environment: "sandbox" }}
 * >
 *   {children}
 * </PayPalProvider>
 */
export const PayPalProvider: React.FC<PayPalProviderProps> = ({
    clientMetadataId,
    clientToken,
    components,
    locale,
    pageType,
    partnerAttributionId,
    shopperSessionId,
    testBuyerCountry,
    children,
    environment,
    debug,
}) => {
    const memoizedComponents = useDeepCompareMemoize(components);

    const [paypalNamespace, setPaypalNamespace] =
        useState<PayPalV6Namespace | null>(null);
    const [state, dispatch] = useReducer(instanceReducer, initialState);
    const environmentRef = useRef(environment);
    const debugRef = useRef(debug);

    // Load Core SDK Script
    useEffect(() => {
        const loadSdk = async () => {
            try {
                const paypal = await loadCoreSdkScript({
                    environment: environmentRef.current,
                    debug: debugRef.current,
                });

                if (paypal) {
                    setPaypalNamespace(paypal);
                }
            } catch (error) {
                const errorInstance =
                    error instanceof Error ? error : new Error(String(error));
                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                    value: errorInstance,
                });
            }
        };

        loadSdk();
    }, []);

    // Create SDK Instance
    useEffect(() => {
        if (!paypalNamespace) {
            return;
        }

        // This dispatch is for instance creations after initial mount
        dispatch({
            type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
            value: INSTANCE_LOADING_STATE.PENDING,
        });

        let isSubscribed = true;

        const createSdkInstance = async () => {
            try {
                // Create SDK instance
                const instance = await paypalNamespace.createInstance({
                    clientMetadataId,
                    clientToken,
                    components: memoizedComponents,
                    locale,
                    pageType,
                    partnerAttributionId,
                    shopperSessionId,
                    testBuyerCountry,
                });

                if (!isSubscribed) {
                    return;
                }

                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE,
                    value: instance,
                });
            } catch (error) {
                if (isSubscribed) {
                    const errorInstance =
                        error instanceof Error
                            ? error
                            : new Error(String(error));
                    dispatch({
                        type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                        value: errorInstance,
                    });
                }
            }
        };

        createSdkInstance();

        return () => {
            isSubscribed = false;
        };
    }, [
        clientMetadataId,
        clientToken,
        locale,
        memoizedComponents,
        pageType,
        partnerAttributionId,
        paypalNamespace,
        shopperSessionId,
        testBuyerCountry,
    ]);

    // Separate effect for eligibility - runs after instance is created
    useEffect(() => {
        // Only run when we have an instance and it's in resolved state
        if (
            !state.sdkInstance ||
            state.loadingStatus !== INSTANCE_LOADING_STATE.RESOLVED
        ) {
            return;
        }

        let isSubscribed = true;

        const loadEligibility = async () => {
            try {
                const eligiblePaymentMethods =
                    await state.sdkInstance?.findEligibleMethods({});

                if (!isSubscribed || !eligiblePaymentMethods) {
                    return;
                }

                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                    value: eligiblePaymentMethods,
                });
            } catch (error) {
                if (isSubscribed) {
                    console.warn(
                        "Failed to get eligible payment methods:",
                        error,
                    );
                }
            }
        };

        loadEligibility();

        return () => {
            isSubscribed = false;
        };
    }, [state.sdkInstance, state.loadingStatus]);

    const contextValue = useMemo(
        () => ({
            sdkInstance: state.sdkInstance,
            eligiblePaymentMethods: state.eligiblePaymentMethods,
            error: state.error,
            dispatch,
            loadingStatus: state.loadingStatus,
        }),
        [
            state.sdkInstance,
            state.eligiblePaymentMethods,
            state.error,
            state.loadingStatus,
            dispatch,
        ],
    );

    return (
        <PayPalContext.Provider value={contextValue}>
            {children}
        </PayPalContext.Provider>
    );
};
