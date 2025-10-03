import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import {
    PayPalContext,
    instanceReducer,
} from "../context/PayPalProviderContext";
import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/PayPalProviderTypes";
import { isServer, useDeepCompareMemoize } from "../utils";

import type {
    CreateInstanceOptions,
    Components,
    LoadCoreSdkScriptOptions,
} from "../types";

type PayPalProviderProps = CreateInstanceOptions<
    readonly [Components, ...Components[]]
> & {
    // Provider-specific properties
    children: React.ReactNode;
    scriptOptions: LoadCoreSdkScriptOptions;
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
    scriptOptions,
}) => {
    // Auto-memoize props based on deep equality to prevent unnecessary reloads
    const memoizedCreateOptions = useDeepCompareMemoize({
        clientMetadataId,
        clientToken,
        components,
        locale,
        pageType,
        partnerAttributionId,
        shopperSessionId,
        testBuyerCountry,
    });
    const memoizedScriptOptions = useDeepCompareMemoize(scriptOptions);

    // Track if we've already handled the initial hydration
    const hasHandledInitialHydration = useRef(false);

    const [state, dispatch] = useReducer(instanceReducer, {
        sdkInstance: null,
        eligiblePaymentMethods: null,
        loadingStatus: INSTANCE_LOADING_STATE.INITIAL,
        error: null,
        createInstanceOptions: memoizedCreateOptions,
        scriptOptions: memoizedScriptOptions,
    });

    // Client-side hydration: transition from INITIAL to PENDING state
    useEffect(() => {
        if (
            !isServer() &&
            state.loadingStatus === INSTANCE_LOADING_STATE.INITIAL &&
            !hasHandledInitialHydration.current
        ) {
            hasHandledInitialHydration.current = true;
            dispatch({
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: INSTANCE_LOADING_STATE.PENDING,
            });
        }
    }, [state.loadingStatus]); // Run when loadingStatus changes, but only act once

    // Auto-sync createInstanceOptions changes (e.g., client token updates)
    useEffect(() => {
        const hasOptionsChanged =
            state.createInstanceOptions !== memoizedCreateOptions ||
            state.scriptOptions !== memoizedScriptOptions;

        if (hasOptionsChanged) {
            dispatch({
                type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
                value: {
                    createInstanceOptions: memoizedCreateOptions,
                    scriptOptions: memoizedScriptOptions,
                },
            });
        }
    }, [memoizedCreateOptions, memoizedScriptOptions]);

    // SDK loading effect - only runs on client (useEffect doesn't run during SSR)
    useEffect(() => {
        if (
            state.loadingStatus !== INSTANCE_LOADING_STATE.PENDING ||
            state.sdkInstance
        ) {
            return;
        }

        let isSubscribed = true;

        const loadSdk = async () => {
            try {
                // Load the core SDK script
                const paypalNamespace = await loadCoreSdkScript(
                    state.scriptOptions,
                );

                if (!isSubscribed || !paypalNamespace) {
                    return;
                }

                // Create SDK instance
                const instance = await paypalNamespace.createInstance(
                    state.createInstanceOptions,
                );

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

        loadSdk();

        return () => {
            isSubscribed = false;
        };
    }, [
        state.loadingStatus,
        state.sdkInstance,
        state.createInstanceOptions,
        state.scriptOptions,
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
