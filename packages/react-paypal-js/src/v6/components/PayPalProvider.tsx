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
import { toError, useCompareMemoize } from "../utils";
import {
    FindEligiblePaymentMethodsRequestPayload,
    FindEligiblePaymentMethodsResponse,
    useEligibleMethods,
} from "../hooks/useEligibleMethods";
import { useError } from "../hooks/useError";

import type {
    Components,
    CreateInstanceOptions,
    LoadCoreSdkScriptOptions,
    PayPalV6Namespace,
} from "../types";
import type { PayPalState } from "../context/PayPalProviderContext";
import type { usePayPal } from "../hooks/usePayPal";

type PayPalProviderProps = Omit<
    CreateInstanceOptions<readonly [Components, ...Components[]]>,
    "components"
> &
    LoadCoreSdkScriptOptions & {
        components?: Components[];
        eligibleMethodsResponse?: FindEligiblePaymentMethodsResponse;
        eligibleMethodsPayload?: FindEligiblePaymentMethodsRequestPayload;
        children: React.ReactNode;
    };

/**
 * {@link PayPalProvider} creates the SDK script, component scripts, runs eligibility, then
 * provides these in context to child components via the {@link usePayPal} hook.
 *
 * @example
 * <PayPalProvider
 *   clientToken={clientToken}
 *   components={["paypal-payments", "venmo-payments"]}
 *   pageType="checkout"
 *  >
 *      // payment buttons
 * </PayPalProvider>
 */
export const PayPalProvider: React.FC<PayPalProviderProps> = ({
    clientMetadataId,
    clientToken,
    components = ["paypal-payments"],
    locale,
    pageType,
    partnerAttributionId,
    shopperSessionId,
    testBuyerCountry,
    eligibleMethodsResponse,
    eligibleMethodsPayload,
    children,
    ...scriptOptions
}) => {
    const memoizedComponents = useCompareMemoize(components);

    const [paypalNamespace, setPaypalNamespace] =
        useState<PayPalV6Namespace | null>(null);
    const [state, dispatch] = useReducer(instanceReducer, initialState);
    // Ref to hold script options to avoid re-running effect
    const loadCoreScriptOptions = useRef(scriptOptions);
    // Using the error hook here so it can participate in side-effects provided by the hook. The actual error
    // instance is stored in the reducer's state.
    const [, setError] = useError();

    const { eligibleMethods, isLoading } = useEligibleMethods({
        eligibleMethodsResponse,
        clientToken,
        payload: eligibleMethodsPayload,
        environment: loadCoreScriptOptions.current.environment,
    });

    useEffect(() => {
        if (!isLoading && eligibleMethods) {
            dispatch({
                type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                value: eligibleMethods,
            });
        }
    }, [isLoading, eligibleMethods]);

    // Load Core SDK Script
    useEffect(() => {
        let isSubscribed = true;

        const loadSdk = async () => {
            try {
                const paypal = await loadCoreSdkScript({
                    environment: loadCoreScriptOptions.current.environment,
                    debug: loadCoreScriptOptions.current.debug,
                    dataNamespace: loadCoreScriptOptions.current.dataNamespace,
                });

                if (!isSubscribed) {
                    return;
                }

                if (paypal) {
                    setPaypalNamespace(paypal);
                }
            } catch (error) {
                if (isSubscribed) {
                    setError(error);
                    dispatch({
                        type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                        value: toError(error),
                    });
                }
            }
        };

        loadSdk();

        return () => {
            isSubscribed = false;
        };
    }, [setError]);

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
                    setError(error);
                    dispatch({
                        type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                        value: toError(error),
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
        setError,
    ]);

    const contextValue: PayPalState = useMemo(
        () => ({
            sdkInstance: state.sdkInstance,
            eligiblePaymentMethods: state.eligiblePaymentMethods,
            error: state.error,
            loadingStatus: state.loadingStatus,
        }),
        [
            state.sdkInstance,
            state.eligiblePaymentMethods,
            state.error,
            state.loadingStatus,
        ],
    );

    return (
        <PayPalContext.Provider value={contextValue}>
            {children}
        </PayPalContext.Provider>
    );
};
