import React from "react";

import { PayPalCardField } from "./PayPalCardField";

import type { CardFieldOptions } from "../types";
import type { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";

type PayPalCardCvvFieldProps = Omit<CardFieldOptions, "type"> & {
    containerStyles?: React.CSSProperties;
    containerClassName?: string;
};

/**
 * `PayPalCardCvvField` is a component that renders a CVV field using the PayPal Card Fields SDK. It must be used within a {@link PayPalCardFieldsProvider} component.
 *
 * @example
 * // Basic usage creating a CVV field
 * <PayPalCardCvvField
 *   placeholder="Enter CVV"
 *   containerStyles={{ height: "3rem", marginBottom: "1rem" }}
 * />
 */
export const PayPalCardCvvField = ({
    containerStyles,
    containerClassName,
    placeholder,
    label,
    style,
    ariaDescription,
    ariaLabel,
    ariaInvalidErrorMessage,
}: PayPalCardCvvFieldProps): JSX.Element | null => {
    return (
        <PayPalCardField
            type="cvv"
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
