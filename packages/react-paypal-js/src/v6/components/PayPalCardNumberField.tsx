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
export const PayPalCardNumberField = ({
    containerStyles,
    containerClassName,
    placeholder,
    label,
    style,
    ariaDescription,
    ariaLabel,
    ariaInvalidErrorMessage,
}: PayPalCardNumberFieldProps): JSX.Element | null => {
    return (
        <PayPalCardField
            type="number"
            containerStyles={containerStyles}
            containerClassName={containerClassName}
            placeholder={placeholder}
            label={label}
            style={style}
            ariaDescription={ariaDescription}
            ariaLabel={ariaLabel}
            ariaInvalidErrorMessage={ariaInvalidErrorMessage}
        />
    );
};
