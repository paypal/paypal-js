import React, { useEffect, useReducer } from "react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import {
    InstanceContext,
    instanceReducer,
} from "../context/InstanceProviderContext";
import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/InstanceProviderTypes";
import { isServer } from "../utils";

import type {
    CreateInstanceOptions,
    Components,
    LoadCoreSdkScriptOptions,
} from "../types";

interface PayPalSdkInstanceProviderProps {
    createInstanceOptions: CreateInstanceOptions<
        readonly [Components, ...Components[]]
    >;
    children: React.ReactNode;
    scriptOptions: LoadCoreSdkScriptOptions;
}

/**
 * PayPal SDK Instance Provider with SSR support
 *
 * SSR Behavior:
 * - Server: Initializes in INITIAL state, no script loading attempted
 * - Client: Initializes in PENDING state, loads scripts on mount
 * - Hydration: Client takes over from server state seamlessly
 */
export const PayPalSdkInstanceProvider: React.FC<
    PayPalSdkInstanceProviderProps
> = ({ createInstanceOptions, children, scriptOptions }) => {
    const [state, dispatch] = useReducer(instanceReducer, {
        sdkInstance: null,
        eligiblePaymentMethods: null,
        loadingStatus: INSTANCE_LOADING_STATE.INITIAL,
        error: null,
        createInstanceOptions,
        scriptOptions,
    });

    // Client-side hydration: transition from INITIAL to PENDING state
    useEffect(() => {
        if (
            !isServer &&
            state.loadingStatus === INSTANCE_LOADING_STATE.INITIAL
        ) {
            dispatch({
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: INSTANCE_LOADING_STATE.PENDING,
            });
        }
    }, []); // Run once on mount

    // Auto-sync createInstanceOptions changes (e.g., client token updates)
    useEffect(() => {
        const hasOptionsChanged =
            state.createInstanceOptions !== createInstanceOptions;

        if (hasOptionsChanged) {
            dispatch({
                type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
                value: {
                    createInstanceOptions,
                    scriptOptions: state.scriptOptions,
                },
            });
        }
    }, [
        createInstanceOptions,
        state.createInstanceOptions,
        state.scriptOptions,
    ]);

    // SDK loading effect - only runs on client (useEffect doesn't run during SSR)
    useEffect(() => {
        if (
            state.loadingStatus !== INSTANCE_LOADING_STATE.PENDING ||
            state.sdkInstance
        ) {
            return;
        }

        let isSubscribed = true;
        const controller = new AbortController();

        const loadSdk = async () => {
            try {
                // Load the core SDK script
                const paypalNamespace = await loadCoreSdkScript(
                    state.scriptOptions,
                );

                if (
                    controller.signal.aborted ||
                    !isSubscribed ||
                    !paypalNamespace
                ) {
                    return;
                }

                // Create SDK instance
                const instance = await paypalNamespace.createInstance(
                    state.createInstanceOptions,
                );

                if (controller.signal.aborted || !isSubscribed) {
                    return;
                }

                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE,
                    value: instance,
                });
            } catch (error) {
                if (!controller.signal.aborted && isSubscribed) {
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
            controller.abort();
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
        const controller = new AbortController();

        const loadEligibility = async () => {
            try {
                const eligiblePaymentMethods =
                    await state.sdkInstance?.findEligibleMethods({});

                if (
                    controller.signal.aborted ||
                    !isSubscribed ||
                    !eligiblePaymentMethods
                ) {
                    return;
                }

                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                    value: eligiblePaymentMethods,
                });
            } catch (error) {
                if (!controller.signal.aborted && isSubscribed) {
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
            controller.abort();
        };
    }, [state.sdkInstance, state.loadingStatus]);

    const contextValue = {
        sdkInstance: state.sdkInstance,
        eligiblePaymentMethods: state.eligiblePaymentMethods,
        error: state.error,
        dispatch,
        loadingStatus: state.loadingStatus,
    };

    return (
        <InstanceContext.Provider value={contextValue}>
            {children}
        </InstanceContext.Provider>
    );
};
