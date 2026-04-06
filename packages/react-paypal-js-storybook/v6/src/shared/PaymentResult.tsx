import React, { useState, useEffect, useCallback } from "react";

export type PaymentResultType = "success" | "cancel" | "error";

export interface PaymentResultDetail {
    type: PaymentResultType;
    message: string;
}

export const PAYMENT_RESULT_EVENT = "paypal-storybook-result";

/**
 * Dispatches a payment result event that the PaymentResult component listens for.
 * Call this from callbacks to show visual feedback in the story.
 */
export function dispatchPaymentResult(
    type: PaymentResultType,
    message: string,
): void {
    document.dispatchEvent(
        new CustomEvent<PaymentResultDetail>(PAYMENT_RESULT_EVENT, {
            detail: { type, message },
        }),
    );
}

const STYLES: Record<PaymentResultType, React.CSSProperties> = {
    success: {
        backgroundColor: "#d4edda",
        borderColor: "#c3e6cb",
        color: "#155724",
    },
    cancel: {
        backgroundColor: "#fff3cd",
        borderColor: "#ffeeba",
        color: "#856404",
    },
    error: {
        backgroundColor: "#f8d7da",
        borderColor: "#f5c6cb",
        color: "#721c24",
    },
};

const LABELS: Record<PaymentResultType, string> = {
    success: "Success",
    cancel: "Cancelled",
    error: "Error",
};

/**
 * Displays payment result feedback (success/cancel/error) as an inline banner.
 * Listens for custom DOM events dispatched by the shared callbacks.
 */
export function PaymentResult() {
    const [result, setResult] = useState<PaymentResultDetail | null>(null);

    const handleEvent = useCallback((e: Event) => {
        const detail = (e as CustomEvent<PaymentResultDetail>).detail;
        setResult(detail);
    }, []);

    useEffect(() => {
        document.addEventListener(PAYMENT_RESULT_EVENT, handleEvent);
        return () => {
            document.removeEventListener(PAYMENT_RESULT_EVENT, handleEvent);
        };
    }, [handleEvent]);

    if (!result) return null;

    return (
        <div
            style={{
                ...STYLES[result.type],
                padding: "12px 16px",
                borderRadius: "4px",
                border: "1px solid",
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                fontSize: "14px",
                lineHeight: "1.5",
            }}
        >
            <div>
                <strong>{LABELS[result.type]}:</strong> {result.message}
            </div>
            <button
                onClick={() => setResult(null)}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    lineHeight: "1",
                    color: "inherit",
                    padding: "0 0 0 12px",
                    opacity: 0.7,
                }}
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}
