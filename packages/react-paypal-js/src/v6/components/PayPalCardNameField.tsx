import React from "react";

import { PayPalCardField } from "./PayPalCardField";

import type { CardFieldOptions } from "../types";
import type { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";

type PayPalCardNameFieldProps = Omit<CardFieldOptions, "type"> & {
  containerStyles?: React.CSSProperties;
  containerClassName?: string;
};

/**
 * `PayPalCardNameField` is a component that renders a name field using the PayPal Card Fields SDK. It must be used within a {@link PayPalCardFieldsProvider} component.
 *
 * @example
 * // Basic usage creating a name field
 * <PayPalCardNameField
 *   placeholder="Enter your name"
 *   containerStyles={{ height: "3rem", marginBottom: "1rem" }}
 * />
 */
export const PayPalCardNameField = ({
  containerStyles,
  containerClassName,
  placeholder,
  label,
  style,
  ariaDescription,
  ariaLabel,
  ariaInvalidErrorMessage,
}: PayPalCardNameFieldProps): JSX.Element | null => {
  return (
    <PayPalCardField
      type="name"
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
