import React, { useEffect, useRef } from "react";

import { usePayPalCardFieldsSession } from "../hooks/usePayPalCardFields";
import { toError } from "../utils";

import type { CardFieldComponent, CardFieldOptions } from "../types";
import type { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";

type PayPalCardFieldProps = CardFieldOptions & {
    containerStyles?: React.CSSProperties;
    containerClassName?: string;
};

/**
 * `PayPalCardField` is a component that renders a single card field (number, expiry, or cvv) using the PayPal Card Fields SDK. It must be used within a {@link PayPalCardFieldsProvider} component.
 *
 * @example
 * // Basic usage creating a number field
 * <PayPalCardField
 *   type="number"
 *   placeholder="Enter a number"
 *   containerStyles={{ height: "3rem", marginBottom: "1rem" }}
 * />
 *
 */
export const PayPalCardField = ({
    containerStyles,
    containerClassName,
    ...options
}: PayPalCardFieldProps): JSX.Element | null => {
    const { cardFieldsSession, setError } = usePayPalCardFieldsSession();
    const cardFieldContainerRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<CardFieldOptions>(options);

    useEffect(() => {
        if (!cardFieldsSession) {
            return;
        }

        let cardField: CardFieldComponent;
        optionsRef.current = options;
        try {
            // TODO: test this error manually on demo page
            // cardField = (cardFieldsSession as any).createCardFieldsComponent({ ...optionsRef.current, type: "number2" });
            cardField = cardFieldsSession.createCardFieldsComponent(
                optionsRef.current,
            );
            cardFieldContainerRef.current?.appendChild(cardField);
        } catch (error) {
            setError(toError(error));
        }

        return () => {
            cardField?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardFieldsSession]);

    // TODO: should I use the isHydrated flag
    // TODO: Test on next to see if this return generates any hydration missmatches. If it does, we might need to conditionally render the container div based on isHydrated
    return (
        <div
            style={containerStyles}
            className={containerClassName}
            ref={cardFieldContainerRef}
        />
    );
};
