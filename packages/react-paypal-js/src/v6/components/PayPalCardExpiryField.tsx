import React from "react";

import { PayPalCardField } from "./PayPalCardField";

import type { CardFieldOptions } from "../types";
import type { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";

type PayPalCardExpiryFieldProps = Omit<CardFieldOptions, "type"> & {
    containerStyles?: React.CSSProperties;
    containerClassName?: string;
};

/**
 * `PayPalCardExpiryField` is a component that renders an expiry field using the PayPal Card Fields SDK. It must be used within a {@link PayPalCardFieldsProvider} component.
 *
 * @example
 * // Basic usage creating an expiry field
 * <PayPalCardExpiryField
 *   placeholder="Enter an expiry date"
 *   containerStyles={{ height: "3rem", marginBottom: "1rem" }}
 * />
 */
export const PayPalCardExpiryField = (
    options: PayPalCardExpiryFieldProps,
): JSX.Element | null => {
    return <PayPalCardField type="expiry" {...options} />;
};
