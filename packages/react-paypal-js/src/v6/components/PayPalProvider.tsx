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
    FindEligiblePaymentMethodsResponse,
    useEligibleMethods,
} from "../hooks/useEligibleMethods";

import type {
    Components,
    CreateInstanceOptions,
    LoadCoreSdkScriptOptions,
    PayPalV6Namespace,
} from "../types";
import type { PayPalState } from "../context/PayPalProviderContext";
import type { usePayPal } from "../hooks/usePayPal";

type PayPalProviderProps = CreateInstanceOptions<
    readonly [Components, ...Components[]]
> &
    LoadCoreSdkScriptOptions & {
        eligibleMethodsResponse?: FindEligiblePaymentMethodsResponse;
        children: React.ReactNode;
    };

/**
 * {@link PayPalProvider} creates the SDK script, component scripts, runs eligibility, then
 * provides these in {@link PayPalContext} to child components via the {@link usePayPal} hook.
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
    eligibleMethodsResponse,
    // TODO add eligible methods payload prop
    children,
    ...scriptOptions
}) => {
    const memoizedComponents = useCompareMemoize(components);

    const [paypalNamespace, setPaypalNamespace] =
        useState<PayPalV6Namespace | null>(null);
    const [state, dispatch] = useReducer(instanceReducer, initialState);
    // Ref to hold script options to avoid re-running effect
    const loadCoreScriptOptions = useRef(scriptOptions);
    const eligibleMethodsResponseRef = useRef(eligibleMethodsResponse);

    // TODO - remove this and use the payload prop
    const { eligibleMethods, isLoading } = useEligibleMethods({
        eligibleMethodsResponse: eligibleMethodsResponseRef.current,
        clientToken,
        payload: {
            preferences: {
                payment_flow: "ONE_TIME_PAYMENT",
                payment_source_constraint: {
                    constraint_type: "INCLUDE",
                    payment_sources: [
                        "PAYPAL_CREDIT",
                        "PAYPAL_PAY_LATER",
                        "PAYPAL",
                        "VENMO",
                    ],
                },
            },
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        // value: "100.00",
                    },
                },
            ],
        },
    });
    // TODO - remove console logs
    console.log("isLoading", isLoading);
    console.log("eligibleMethods", eligibleMethods);

    if (!isLoading && eligibleMethods && !state.eligiblePaymentMethods) {
        dispatch({
            type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
            value: eligibleMethods,
        });
    }
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
