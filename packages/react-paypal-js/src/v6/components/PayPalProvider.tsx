import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import {
    PayPalContext,
    instanceReducer,
} from "../context/PayPalProviderContext";
import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/PayPalProviderEnums";
import { isServer, useDeepCompareMemoize } from "../utils";

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

    useEffect(() => {
        if (!state.sdkInstance) {
            return;
        }

        dispatch({
            type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
            value: INSTANCE_LOADING_STATE.PENDING,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memoizedScriptOptions]); // Only reset when script options change

    useEffect(() => {
        if (!state.sdkInstance) {
            return;
        }

        dispatch({
            type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
            value: INSTANCE_LOADING_STATE.SDK_LOADED,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memoizedCreateOptions]); // Only reset when create options change

    useEffect(() => {
        if (state.loadingStatus !== INSTANCE_LOADING_STATE.PENDING) {
            return;
        }

        const loadSdk = async () => {
            try {
                // TODO: Maybe we can remove returning the sdk instance from loadCoreSdkScript?
                await loadCoreSdkScript(memoizedScriptOptions);

                if (!window.paypal?.version.startsWith("6")) {
                    throw new Error("Failed to load PayPal SDK");
                }

                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                    value: INSTANCE_LOADING_STATE.SDK_LOADED,
                });
            } catch (error) {
                console.error(error);
                const errorInstance =
                    error instanceof Error ? error : new Error(String(error));
                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                    value: errorInstance,
                });
            }
        };

        loadSdk();
    }, [state.loadingStatus, memoizedScriptOptions]);

    useEffect(() => {
        if (state.loadingStatus !== INSTANCE_LOADING_STATE.SDK_LOADED) {
            return;
        }

        const createInstance = async () => {
            try {
                const paypalNamespace =
                    window.paypal as unknown as PayPalV6Namespace;

                if (!paypalNamespace) {
                    throw new Error("PayPal sdk not available");
                }

                const instance = await paypalNamespace.createInstance(
                    memoizedCreateOptions,
                );

                if (!instance) {
                    throw new Error("Failed to create PayPal SDK instance");
                }

                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE,
                    value: instance,
                });
            } catch (error) {
                console.error(error);
                const errorInstance =
                    error instanceof Error ? error : new Error(String(error));
                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                    value: errorInstance,
                });
            }
        };

        createInstance();
        // TODO: Need to cleanup components loaded by instance. For example if venmo-payments is initially loading by createInstance but then removed from the components array createVenmoOneTimePaymentSession would still be available on the instance.
    }, [state.loadingStatus, memoizedCreateOptions]);

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
