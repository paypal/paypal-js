import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import {
    PayPalContext,
    initialState,
    instanceReducer,
} from "../context/PayPalProviderContext";
import { PayPalDispatchContext } from "../context/PayPalDispatchContext";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/PayPalProviderEnums";
import { toError, useCompareMemoize, useDeepCompareMemoize } from "../utils";
import { useError } from "../hooks/useError";

import type {
    Components,
    CreateInstanceOptions,
    FindEligiblePaymentMethodsResponse,
    LoadCoreSdkScriptOptions,
    PayPalV6Namespace,
} from "../types";
import type { PayPalState } from "../context/PayPalProviderContext";
import type { usePayPal } from "../hooks/usePayPal";

type PayPalProviderPropsBase = Omit<
    CreateInstanceOptions<readonly [Components, ...Components[]]>,
    "components" | "clientToken" | "clientId"
> &
    Omit<LoadCoreSdkScriptOptions, "dataSdkIntegrationSource"> & {
        components?: Components[];
        eligibleMethodsResponse?: FindEligiblePaymentMethodsResponse;
        children: React.ReactNode;
    };

type PayPalProviderProps =
    | (PayPalProviderPropsBase & {
          clientToken: string | Promise<string> | undefined;
          clientId?: never;
      })
    | (PayPalProviderPropsBase & {
          clientId: string | Promise<string> | undefined;
          clientToken?: never;
      });

/**
 * {@link PayPalProvider} creates the SDK script, component scripts, runs eligibility, then
 * provides these in context to child components via the {@link usePayPal} hook.
 *
 * SDK loading is automatically deferred until clientToken or clientId is available.
 * Both can be either a string, Promise, or undefined.
 *
 * **Important:** When passing a Promise, you must ensure referential stability across renders.
 * An unstable Promise reference (e.g., calling `fetchClientToken()` or `fetchClientId()` inline)
 * will cause the SDK to re-initialize on every render. Wrap the promise in `useMemo` or store it in state.
 *
 * @example
 * // With string clientToken
 * <PayPalProvider
 *   clientToken={token}
 *   components={["paypal-payments", "venmo-payments"]}
 *   pageType="checkout"
 * >
 *   <PayPalOneTimePaymentButton />
 * </PayPalProvider>
 *
 * @example
 * // With string clientId
 * <PayPalProvider
 *   clientId="YOUR_CLIENT_ID"
 *   components={["paypal-payments"]}
 *   pageType="checkout"
 * >
 *   <PayPalOneTimePaymentButton />
 * </PayPalProvider>
 *
 * @example
 * // With Promise clientToken (memoize to prevent re-fetching)
 * const tokenPromise = useMemo(() => fetchClientToken(), []);
 *
 * <PayPalProvider
 *   clientToken={tokenPromise}
 *   pageType="checkout"
 * >
 *   <PayPalOneTimePaymentButton />
 * </PayPalProvider>
 *
 * @example
 * // With Promise clientId
 * const clientIdPromise = useMemo(() => fetchClientId(), []);
 *
 * <PayPalProvider
 *   clientId={clientIdPromise}
 *   pageType="checkout"
 * >
 *   <PayPalOneTimePaymentButton />
 * </PayPalProvider>
 *
 * @example
 * // With deferred loading (clientToken)
 * const [clientToken, setClientToken] = useState<string>();
 *
 * useEffect(() => {
 *   fetchClientToken().then(setClientToken);
 * }, []);
 *
 * <PayPalProvider
 *   clientToken={clientToken}
 *   pageType="checkout"
 * >
 *   <PayPalOneTimePaymentButton />
 * </PayPalProvider>
 *
 * @example
 * // With deferred loading (clientId)
 * const [clientId, setClientId] = useState<string>();
 *
 * useEffect(() => {
 *   fetchClientId().then(setClientId);
 * }, []);
 *
 * <PayPalProvider
 *   clientId={clientId}
 *   pageType="checkout"
 * >
 *   <PayPalOneTimePaymentButton />
 * </PayPalProvider>
 *
 * @example
 * // Show custom loader while SDK initializes
 * function MyCheckout() {
 *   const { loadingStatus } = usePayPal();
 *   const isPending = loadingStatus === INSTANCE_LOADING_STATE.PENDING;
 *
 *   if (isPending) {
 *     return <div>Loading PayPal SDK...</div>;
 *   }
 *
 *   return <PayPalOneTimePaymentButton orderId="ORDER-123" />;
 * }
 *
 * <PayPalProvider clientToken={token} pageType="checkout">
 *   <MyCheckout />
 * </PayPalProvider>
 */
export const PayPalProvider: React.FC<PayPalProviderProps> = ({
    clientMetadataId,
    clientToken,
    clientId,
    components = ["paypal-payments"],
    locale,
    pageType,
    partnerAttributionId,
    shopperSessionId,
    testBuyerCountry,
    eligibleMethodsResponse,
    children,
    merchantId,
    ...scriptOptions
}) => {
    const memoizedComponents = useCompareMemoize(components);
    const memoizedMerchantId = useDeepCompareMemoize(merchantId);
    const [paypalNamespace, setPaypalNamespace] =
        useState<PayPalV6Namespace | null>(null);
    const [state, dispatch] = useReducer(instanceReducer, initialState);
    const [isHydrated, setIsHydrated] = useState(false);
    // Ref to hold script options to avoid re-running effect
    const loadCoreScriptOptions = useRef({
        ...scriptOptions,
        dataSdkIntegrationSource: "react-paypal-js",
    });

    // Set hydrated state after initial client render to prevent hydration mismatch
    useIsomorphicLayoutEffect(() => {
        setIsHydrated(true);
    }, []);

    // Using the error hook here so it can participate in side-effects provided by the hook.
    // The actual error instance is stored in the reducer's state.
    const [, setError] = useError();

    // Load Core SDK script
    useEffect(() => {
        let isSubscribed = true;

        const loadSdk = async () => {
            try {
                const sdkNamespace = await loadCoreSdkScript({
                    environment: loadCoreScriptOptions.current.environment,
                    debug: loadCoreScriptOptions.current.debug,
                    dataNamespace: loadCoreScriptOptions.current.dataNamespace,
                    dataSdkIntegrationSource:
                        loadCoreScriptOptions.current.dataSdkIntegrationSource,
                });

                if (sdkNamespace && isSubscribed) {
                    setPaypalNamespace(sdkNamespace);
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

        if (!clientToken && !clientId) {
            return;
        }

        dispatch({
            type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
            value: INSTANCE_LOADING_STATE.PENDING,
        });

        let isSubscribed = true;

        const createSdkInstance = async () => {
            try {
                const authCredential = clientToken || clientId;
                const isClientToken = !!clientToken;

                let credentialValue: string | undefined;
                if (typeof authCredential === "string") {
                    credentialValue = authCredential;
                } else if (authCredential) {
                    try {
                        credentialValue = await authCredential;
                    } catch (error) {
                        const authError = new Error(
                            `Failed to resolve ${isClientToken ? "clientToken" : "clientId"}. Expected a Promise that resolves to a string, but it was rejected with: ${toError(error).message}`,
                        );
                        if (isSubscribed) {
                            setError(authError);
                            dispatch({
                                type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                                value: authError,
                            });
                        }
                        return;
                    }
                }

                if (!credentialValue || !isSubscribed) {
                    return;
                }

                const baseOptions = {
                    clientMetadataId,
                    components: memoizedComponents,
                    locale,
                    pageType,
                    partnerAttributionId,
                    shopperSessionId,
                    testBuyerCountry,
                    merchantId: memoizedMerchantId,
                };

                const instanceOptions = isClientToken
                    ? { ...baseOptions, clientToken: credentialValue }
                    : { ...baseOptions, clientId: credentialValue };

                const instance =
                    await paypalNamespace.createInstance(instanceOptions);

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
        clientId,
        locale,
        memoizedComponents,
        memoizedMerchantId,
        pageType,
        partnerAttributionId,
        paypalNamespace,
        shopperSessionId,
        testBuyerCountry,
        setError,
    ]);

    useEffect(() => {
        const sdkInstance = state.sdkInstance;
        if (!sdkInstance) {
            return;
        }

        try {
            if (eligibleMethodsResponse) {
                const eligiblePaymentMethods =
                    sdkInstance.hydrateEligibleMethods(eligibleMethodsResponse);
                dispatch({
                    type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                    value: { eligiblePaymentMethods, payload: null },
                });
            }
        } catch (error) {
            setError(error);
            dispatch({
                type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                value: toError(error),
            });
        }
    }, [state.sdkInstance, eligibleMethodsResponse, setError]);

    const contextValue: PayPalState = useMemo(
        () => ({
            sdkInstance: state.sdkInstance,
            eligiblePaymentMethods: state.eligiblePaymentMethods,
            eligiblePaymentMethodsPayload: state.eligiblePaymentMethodsPayload,
            error: state.error,
            loadingStatus: state.loadingStatus,
            isHydrated,
        }),
        [
            state.sdkInstance,
            state.eligiblePaymentMethods,
            state.eligiblePaymentMethodsPayload,
            state.error,
            state.loadingStatus,
            isHydrated,
        ],
    );

    return (
        <PayPalDispatchContext.Provider value={dispatch}>
            <PayPalContext.Provider value={contextValue}>
                {children}
            </PayPalContext.Provider>
        </PayPalDispatchContext.Provider>
    );
};
