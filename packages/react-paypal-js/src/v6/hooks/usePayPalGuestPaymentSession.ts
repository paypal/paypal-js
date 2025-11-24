import { useCallback, useEffect, useRef } from "react";

import { usePayPal } from "./usePayPal";
import { useIsMountedRef } from "./useIsMounted";
import { useError } from "./useError";
import { useProxyProps } from "../utils";

import type {
    PayPalGuestOneTimePaymentSession,
    PayPalGuestOneTimePaymentSessionOptions,
    PayPalGuestOneTimePaymentSessionPromise,
    PayPalGuestPresentationModeOptions,
    OnShippingAddressChangeData,
    OnShippingOptionsChangeData,
} from "@paypal/paypal-js/sdk-v6";
import type { BasePaymentSessionReturn } from "../types";

export interface PayPalGuestPaymentSessionReturn
    extends BasePaymentSessionReturn {
    buttonRef: { current: HTMLElement | null };
}

export type UsePayPalGuestPaymentSessionProps = (
    | (Omit<PayPalGuestOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: () => PayPalGuestOneTimePaymentSessionPromise;
          orderId?: never;
      })
    | (PayPalGuestOneTimePaymentSessionOptions & {
          createOrder?: never;
          orderId: string;
      })
) & {
    buyerCountry?: string;
    targetElement?: string | HTMLElement;
    presentationMode?: "auto";
    fullPageOverlay?: boolean;
    autoRedirect?: boolean;
    onShippingAddressChange?: (
        data: OnShippingAddressChangeData,
    ) => Promise<void>;
    onShippingOptionsChange?: (
        data: OnShippingOptionsChangeData,
    ) => Promise<void>;
};

export function usePayPalGuestPaymentSession({
    presentationMode = "auto",
    fullPageOverlay,
    createOrder,
    orderId,
    targetElement,
    onShippingAddressChange,
    onShippingOptionsChange,
    ...callbacks
}: UsePayPalGuestPaymentSessionProps): PayPalGuestPaymentSessionReturn {
    const { sdkInstance } = usePayPal();
    const isMountedRef = useIsMountedRef();
    const sessionRef = useRef<PayPalGuestOneTimePaymentSession | null>(null);
    const buttonRef = useRef<HTMLElement>(null);
    const proxyCallbacks = useProxyProps(callbacks);
    const [error, setError] = useError();
    const isSessionActiveRef = useRef(false);

    const handleDestroy = useCallback(() => {
        sessionRef.current?.destroy();
        sessionRef.current = null;
        isSessionActiveRef.current = false;
    }, []);

    useEffect(() => {
        if (!sdkInstance) {
            setError(new Error("no sdk instance available"));
        }
    }, [sdkInstance, setError]);

    useEffect(() => {
        if (!sdkInstance) {
            return;
        }

        const newSession = sdkInstance.createPayPalGuestOneTimePaymentSession({
            orderId,
            ...proxyCallbacks,
            ...(onShippingAddressChange && { onShippingAddressChange }),
            ...(onShippingOptionsChange && { onShippingOptionsChange }),
        });
        sessionRef.current = newSession;

        return () => {
            newSession.destroy();
            isSessionActiveRef.current = false;
        };
    }, [
        sdkInstance,
        orderId,
        proxyCallbacks,
        onShippingAddressChange,
        onShippingOptionsChange,
        isMountedRef,
    ]);

    const handleCancel = useCallback(() => {
        sessionRef.current?.cancel();
        isSessionActiveRef.current = false;
    }, []);

    const handleClick = useCallback(async () => {
        if (!isMountedRef.current) {
            return;
        }
        if (!sessionRef.current) {
            setError(new Error("PayPal Guest Checkout session not available"));
            return;
        }

        if (isSessionActiveRef.current) {
            return;
        }

        isSessionActiveRef.current = true;

        try {
            const target = targetElement || buttonRef.current;
            const startOptions: PayPalGuestPresentationModeOptions = {
                presentationMode,
                ...(fullPageOverlay !== undefined && {
                    fullPageOverlay: { enabled: fullPageOverlay },
                }),
                ...(target ? { targetElement: target as EventTarget } : {}),
            };
            const checkoutOptionsPromise = createOrder
                ? createOrder()
                : undefined;
            await sessionRef.current.start(
                startOptions,
                checkoutOptionsPromise,
            );
        } catch (err) {
            if (isMountedRef.current) {
                isSessionActiveRef.current = false;
                setError(err instanceof Error ? err : new Error(String(err)));
            }
        }
    }, [
        isMountedRef,
        presentationMode,
        fullPageOverlay,
        createOrder,
        targetElement,
        setError,
    ]);

    return {
        buttonRef,
        error,
        handleCancel,
        handleClick,
        handleDestroy,
    };
}
