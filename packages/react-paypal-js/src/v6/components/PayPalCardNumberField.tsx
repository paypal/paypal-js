import React from "react";

import { PayPalCardField } from "./PayPalCardField";

import type { CardFieldOptions } from "../types";
import type { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";

type PayPalCardNumberFieldProps = Omit<CardFieldOptions, "type"> & {
    containerStyles?: React.CSSProperties;
    containerClassName?: string;
};

/**
 * `PayPalCardNumberField` is a component that renders a card number field using the PayPal Card Fields SDK. It must be used within a {@link PayPalCardFieldsProvider} component.
 *
 * @example
 * // Basic usage creating a number field
 * <PayPalCardNumberField
 *   placeholder="Enter a card number"
 *   containerStyles={{ height: "3rem", marginBottom: "1rem" }}
 * />
 */
export const PayPalCardNumberField = (
    options: PayPalCardNumberFieldProps,
): JSX.Element | null => {
    return <PayPalCardField type="number" {...options} />;
};
